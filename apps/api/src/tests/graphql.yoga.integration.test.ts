import type { AwilixContainer } from 'awilix';

import type { IocGeneratedCradle } from '../di/generated/ioc-registry.types';
import { createExecuteGraphQL } from './executeGQL';
import { setupGraphqlIntegrationTests } from './graphqlIntegrationTestSetup';
import { resetIntegrationTestDb } from './resetDb';
import { TEST_VIEWER_1_ID } from './testViewerIds';

/** Masked generic errors vs explicit auth errors (resolver / gateway behavior may differ). */
const authRequiredMutationErrorMessages = ['Unexpected error.', 'Not authenticated'];

describe('GraphQL', () => {
  let executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
  let container: AwilixContainer<IocGeneratedCradle>;
  let mediaStorageRoot: string;

  beforeAll(async () => {
    const setup = await setupGraphqlIntegrationTests();
    container = setup.container;
    executeGraphQL = setup.executeGraphQL;
    mediaStorageRoot = container.resolve('config').mediaStorageRoot;
  });

  afterEach(async () => {
    await resetIntegrationTestDb(container.resolve('database'), mediaStorageRoot);
  });

  describe('viewer', () => {
    describe('when executing the viewer query while logged out', () => {
      it('should return null for viewer', async () => {
        const { response, json } = await executeGraphQL({
          query: `
            query {
              viewer {
                id
                displayName
              }
            }
          `,
          context: {
            isLoggedIn: false,
          },
        });
        expect(response.status).toBe(200);
        expect(json.errors).toBeUndefined();
        expect(json.data).toEqual({
          viewer: null,
        });
      });
    });

    describe('when executing the viewer query while logged in', () => {
      it('should return the current user', async () => {
        const { response, json } = await executeGraphQL({
          query: `
            query {
              viewer {
                id
                displayName
              }
            }
          `,
          context: {
            isLoggedIn: true,
          },
        });

        expect(response.status).toBe(200);
        expect(json.errors).toBeUndefined();
        expect(json.data?.viewer).toBeTruthy();
        expect(json.data?.viewer?.id).toBe(TEST_VIEWER_1_ID);
        expect(json.data?.viewer?.displayName).toBe('Demo User');
      });
    });
  });

  describe('createMediaUpload mutation', () => {
    describe('when executing while logged out', () => {
      it('should return an authentication error', async () => {
        const { response, json } = await executeGraphQL({
          query: `
            mutation {
              createMediaUpload(
                input: { kind: PHOTO, mimeType: "image/jpeg" }
              ) {
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
          context: {
            isLoggedIn: false,
          },
        });
        expect(response.status).toBe(200);
        expect(json.data).toBeNull();
        expect(authRequiredMutationErrorMessages.some((m) => m === json.errors?.[0]?.message)).toBe(
          true,
        );
      });
    });
  });

  describe('finalizeMediaUpload mutation', () => {
    describe('when executing while logged out', () => {
      it('should return an authentication error', async () => {
        const { response, json } = await executeGraphQL({
          query: `
            mutation {
              finalizeMediaUpload(input: { mediaItemId: "media-1" }) {
                data {
                  mediaItemId
                  status
                  kind
                  size
                }
                errors {
                  code
                  message
                }
              }
            }
          `,
          context: {
            isLoggedIn: false,
          },
        });

        expect(response.status).toBe(200);
        expect(json.data).toBeNull();
        expect(authRequiredMutationErrorMessages.some((m) => m === json.errors?.[0]?.message)).toBe(
          true,
        );
      });
    });
  });
});
