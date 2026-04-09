import { AppErrorCollection, MediaItemStatus } from '@packages/contracts';
import type { AwilixContainer } from 'awilix';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Server } from 'node:http';
import request from 'supertest';

import type { IocGeneratedCradle } from '../di/generated/ioc-registry.types';
import { createExecuteGraphQL } from './executeGQL';
import { setupGraphqlIntegrationTests } from './graphqlIntegrationTestSetup';
import { resetIntegrationTestDb } from './resetDb';
import { TEST_VIEWER_1_ID, TEST_VIEWER_B_ID } from './testViewerIds';

const issueBearerForTestUser = (
  container: AwilixContainer<IocGeneratedCradle>,
  userId: string,
  email: string,
): string => {
  const { jwtSecret, jwtExpiresIn } = container.resolve('config');
  return jwt.sign({ userId, email, role: 'kid' }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  } as SignOptions);
};

describe('GraphQL media upload integration', () => {
  let executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
  let container: AwilixContainer<IocGeneratedCradle>;
  let koaServer: Server;
  let mediaStorageRoot: string;

  beforeAll(async () => {
    const setup = await setupGraphqlIntegrationTests();
    container = setup.container;
    executeGraphQL = setup.executeGraphQL;
    koaServer = setup.container.resolve('koaServer');
    mediaStorageRoot = container.resolve('config').mediaStorageRoot;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      if (!koaServer.listening) {
        resolve();
        return;
      }
      koaServer.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });

  afterEach(async () => {
    await resetIntegrationTestDb(container.resolve('database'), mediaStorageRoot);
  });

  describe('When createMediaUpload runs for an authenticated viewer', () => {
    it('should return pending status and upload instructions', async () => {
      const { response, json } = await executeGraphQL<{
        createMediaUpload: {
          data?: {
            mediaItemId: string;
            status: string;
            uploadInstructions: { method: string; url: string };
          };
          errors: { code: string }[];
        };
      }>({
        query: `
          mutation {
            createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
              data {
                mediaItemId
                status
                uploadInstructions {
                  method
                  url
                }
              }
              errors {
                code
                message
              }
            }
          }
        `,
        context: { isLoggedIn: true },
      });

      expect(response.status).toBe(200);
      expect(json.errors).toBeUndefined();
      expect(json.data?.createMediaUpload.errors).toEqual([]);
      const payload = json.data?.createMediaUpload.data;
      expect(payload?.status).toBe(MediaItemStatus.pending.value);
      expect(payload?.uploadInstructions.method).toBe('PUT');
      expect(payload?.uploadInstructions.url).toMatch(/\/api\/media\/uploads\//);
      expect(payload?.mediaItemId).toBeTruthy();
    });
  });

  describe('When finalizeMediaUpload runs before the Koa upload has persisted bytes', () => {
    it('should surface a client-safe failure without an unhandled exception', async () => {
      // Real clients: createMediaUpload → PUT /api/media/uploads/:mediaItemId (raw body, Content-Type = mime) → finalizeMediaUpload.
      // This scenario skips the HTTP upload so storage has no object yet.
      const created = await executeGraphQL<{
        createMediaUpload: { data?: { mediaItemId: string }; errors: { code: string }[] };
      }>({
        query: `
          mutation {
            createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
              data {
                mediaItemId
              }
              errors {
                code
              }
            }
          }
        `,
        context: { isLoggedIn: true },
      });
      expect(created.json.errors).toBeUndefined();
      expect(created.json.data?.createMediaUpload.errors).toEqual([]);
      const mediaItemId = created.json.data?.createMediaUpload.data?.mediaItemId;
      expect(mediaItemId).toBeTruthy();
      if (!mediaItemId) {
        return;
      }

      const { response, json } = await executeGraphQL<{
        finalizeMediaUpload: {
          data?: { mediaItemId: string; status: string; size: number };
          errors: { code: string; message: string }[];
        };
      }>({
        query: `
          mutation ($id: ID!) {
            finalizeMediaUpload(input: { mediaItemId: $id }) {
              data {
                mediaItemId
                status
                size
              }
              errors {
                code
                message
              }
            }
          }
        `,
        variables: { id: mediaItemId },
        context: { isLoggedIn: true },
      });

      expect(response.status).toBe(200);
      expect(json.errors).toBeUndefined();
      expect(json.data?.finalizeMediaUpload.data).toBeFalsy();
      expect(json.data?.finalizeMediaUpload.errors[0]?.code).toBe(
        AppErrorCollection.mediaItem.MediaBytesNotFound.code,
      );
      expect(json.data?.finalizeMediaUpload.errors[0]?.message).toBe(
        AppErrorCollection.mediaItem.MediaBytesNotFound.display,
      );
    });
  });

  describe('When the viewer uploads bytes via the Koa API then calls finalizeMediaUpload', () => {
    it('should transition the media item to ready', async () => {
      const token = issueBearerForTestUser(
        container,
        TEST_VIEWER_1_ID,
        'test-viewer-1@example.test',
      );

      const created = await executeGraphQL<{
        createMediaUpload: { data?: { mediaItemId: string }; errors: { code: string }[] };
      }>({
        query: `
          mutation {
            createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
              data {
                mediaItemId
              }
              errors {
                code
              }
            }
          }
        `,
        context: { isLoggedIn: true },
      });
      expect(created.json.errors).toBeUndefined();
      expect(created.json.data?.createMediaUpload.errors).toEqual([]);
      const mediaItemId = created.json.data?.createMediaUpload.data?.mediaItemId;
      expect(mediaItemId).toBeTruthy();
      if (!mediaItemId) {
        return;
      }

      const uploadRes = await request(koaServer)
        .put(`/api/media/uploads/${mediaItemId}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'image/jpeg')
        .send(Buffer.from([0xff, 0xd8, 0xff]));
      expect(uploadRes.status).toBe(201);

      const { response, json } = await executeGraphQL<{
        finalizeMediaUpload: {
          data?: { mediaItemId: string; status: string; size: number };
          errors: { code: string }[];
        };
      }>({
        query: `
          mutation ($id: ID!) {
            finalizeMediaUpload(input: { mediaItemId: $id }) {
              data {
                mediaItemId
                status
                size
              }
              errors {
                code
              }
            }
          }
        `,
        variables: { id: mediaItemId },
        context: { isLoggedIn: true },
      });

      expect(response.status).toBe(200);
      expect(json.errors).toBeUndefined();
      expect(json.data?.finalizeMediaUpload.errors).toEqual([]);
      expect(json.data?.finalizeMediaUpload.data?.mediaItemId).toBe(mediaItemId);
      expect(json.data?.finalizeMediaUpload.data?.status).toBe(MediaItemStatus.ready.value);
      expect(json.data?.finalizeMediaUpload.data?.size).toBeGreaterThan(0);
    });
  });

  describe('When finalizeMediaUpload is invoked by a different viewer than the owner', () => {
    it('should fail without transitioning the media item for the attacker', async () => {
      const created = await executeGraphQL<{
        createMediaUpload: { data?: { mediaItemId: string }; errors: { code: string }[] };
      }>({
        query: `
          mutation {
            createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
              data {
                mediaItemId
              }
              errors {
                code
              }
            }
          }
        `,
        context: { isLoggedIn: true },
      });
      expect(created.json.errors).toBeUndefined();
      expect(created.json.data?.createMediaUpload.errors).toEqual([]);
      const mediaItemId = created.json.data?.createMediaUpload.data?.mediaItemId;
      if (!mediaItemId) {
        return;
      }

      const { json } = await executeGraphQL<{
        finalizeMediaUpload: {
          data?: { mediaItemId: string; status: string };
          errors: { code: string; message: string }[];
        };
      }>({
        query: `
          mutation ($id: ID!) {
            finalizeMediaUpload(input: { mediaItemId: $id }) {
              data {
                mediaItemId
                status
              }
              errors {
                code
                message
              }
            }
          }
        `,
        variables: { id: mediaItemId },
        context: {
          isLoggedIn: true,
          user: {
            id: TEST_VIEWER_B_ID,
            firstName: 'B',
            lastName: 'B',
            email: 'b@example.com',
          },
        },
      });

      expect(json.errors).toBeUndefined();
      expect(json.data?.finalizeMediaUpload.data).toBeFalsy();
      expect(json.data?.finalizeMediaUpload.errors[0]?.code).toBe(
        AppErrorCollection.mediaItem.MediaItemNotOwnedByViewer.code,
      );
    });
  });
});
