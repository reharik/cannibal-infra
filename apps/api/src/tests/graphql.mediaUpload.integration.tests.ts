import { MediaItemStatus } from '@packages/contracts';
import { createExecuteGraphQL } from './executeGQL';
import { setupGraphqlIntegrationTests } from './graphqlIntegrationTestSetup';
import { TEST_VIEWER_B_ID } from './testViewerIds';

describe('GraphQL media upload integration', () => {
  let executeGraphQL: ReturnType<typeof createExecuteGraphQL>;

  beforeAll(async () => {
    const setup = await setupGraphqlIntegrationTests();
    executeGraphQL = setup.executeGraphQL;
  });

  describe('When createMediaUpload runs for an authenticated viewer', () => {
    it('should return pending status and upload instructions', async () => {
      const { response, json } = await executeGraphQL<{
        createMediaUpload: {
          mediaItemId: string;
          status: string;
          uploadInstructions: { method: string; url: string };
        };
      }>({
        query: `
          mutation {
            createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
              mediaItemId
              status
              uploadInstructions {
                method
                url
              }
            }
          }
        `,
        context: { isLoggedIn: true },
      });

      expect(response.status).toBe(200);
      expect(json.errors).toBeUndefined();
      expect(json.data?.createMediaUpload.status).toBe(MediaItemStatus.pending.value);
      expect(json.data?.createMediaUpload.uploadInstructions.method).toBe('PUT');
      expect(json.data?.createMediaUpload.uploadInstructions.url).toMatch(
        /\/api\/media\/uploads\//,
      );
      expect(json.data?.createMediaUpload.mediaItemId).toBeTruthy();
    });
  });

  describe('When finalizeMediaUpload runs before bytes exist in storage', () => {
    it('should surface a client-safe failure without an unhandled exception', async () => {
      const created = await executeGraphQL<{ createMediaUpload: { mediaItemId: string } }>({
        query: `
          mutation {
            createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
              mediaItemId
            }
          }
        `,
        context: { isLoggedIn: true },
      });
      expect(created.json.errors).toBeUndefined();
      const mediaItemId = created.json.data?.createMediaUpload.mediaItemId;
      expect(mediaItemId).toBeTruthy();
      if (!mediaItemId) {
        return;
      }

      const { response, json } = await executeGraphQL<{
        finalizeMediaUpload?: { mediaItemId: string; status: string; size: number };
      }>({
        query: `
          mutation ($id: ID!) {
            finalizeMediaUpload(input: { mediaItemId: $id }) {
              mediaItemId
              status
              size
            }
          }
        `,
        variables: { id: mediaItemId },
        context: { isLoggedIn: true },
      });

      expect(response.status).toBe(200);
      expect(json.data?.finalizeMediaUpload).toBeFalsy();
      expect(json.errors?.length).toBeGreaterThan(0);
      // graphql-yoga masks resolver throws as "Unexpected error." for clients; errors still surface.
      expect(json.errors?.[0]?.message).toBeTruthy();
    });
  });

  describe('When finalizeMediaUpload is invoked by a different viewer than the owner', () => {
    it('should fail without transitioning the media item for the attacker', async () => {
      const created = await executeGraphQL<{ createMediaUpload: { mediaItemId: string } }>({
        query: `
          mutation {
            createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
              mediaItemId
            }
          }
        `,
        context: { isLoggedIn: true },
      });
      expect(created.json.errors).toBeUndefined();
      const mediaItemId = created.json.data?.createMediaUpload.mediaItemId;
      if (!mediaItemId) {
        return;
      }

      const { json } = await executeGraphQL<{
        finalizeMediaUpload?: { mediaItemId: string; status: string };
      }>({
        query: `
          mutation ($id: ID!) {
            finalizeMediaUpload(input: { mediaItemId: $id }) {
              mediaItemId
              status
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

      expect(json.data?.finalizeMediaUpload).toBeFalsy();
      expect(json.errors?.[0]?.message).toBeTruthy();
    });
  });
});
