import { AwilixContainer } from 'awilix';
import { initializeContainer } from '../container';
import { IocGeneratedCradle } from '../di/generated/ioc-registry.types';
import { createExecuteGraphQL } from './executeGQL';

describe('GraphQL', () => {
  let executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
  let container: AwilixContainer<IocGeneratedCradle>;
  beforeAll(async () => {
    container = initializeContainer();
    const yogaApp = container.resolve('yogaApp');
    executeGraphQL = createExecuteGraphQL({ yogaApp });
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
        expect(json.data?.viewer?.id).toBe('viewer-1');
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
                mediaItemId
                status
                uploadInstructions {
                  method
                  url
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
        expect(json.errors?.[0]?.message).toBe('Unexpected error.');
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
                mediaItemId
                status
                kind
                size
              }
            }
          `,
          context: {
            isLoggedIn: false,
          },
        });

        expect(response.status).toBe(200);
        expect(json.data).toBeNull();
        expect(json.errors?.[0]?.message).toBe('Unexpected error.');
      });
    });
  });
});
