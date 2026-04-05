import { randomUUID } from 'node:crypto';

import type { AwilixContainer } from 'awilix';
import type { Knex } from 'knex';

import type { IocGeneratedCradle } from '../di/generated/ioc-registry.types';
import { createExecuteGraphQL } from './executeGQL';
import { setupGraphqlIntegrationTests } from './graphqlIntegrationTestSetup';
import { writeLocalMediaObjectBytesForIntegrationTest } from './integrationMediaObjectTestHelper';
import { resetIntegrationTestDb } from './resetDb';
import { TEST_VIEWER_1_ID, TEST_VIEWER_A_ID } from './testViewerIds';

const missingAlbumId = '00000000-0000-4000-8000-000000000099';
const missingMediaItemId = '00000000-0000-4000-8000-000000000088';

/** graphql-yoga default masked message for thrown resolver errors (see graphql.yoga.integration.test.ts). */
const maskedResolverErrorMessage = 'Unexpected error.';

const loggedInViewer1 = { isLoggedIn: true as const };

const loggedInViewerA = {
  isLoggedIn: true as const,
  user: {
    id: TEST_VIEWER_A_ID,
    firstName: 'Viewer',
    lastName: 'A',
    email: 'test-viewer-a@example.test',
  },
};

const createAlbumMutation = `
  mutation CreateAlbumForTest($title: String!) {
    createAlbum(input: { title: $title }) {
      albumId
    }
  }
`;

const createMediaUploadMutation = `
  mutation {
    createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
      mediaItemId
    }
  }
`;

const finalizeMediaUploadMutation = `
  mutation FinalizeMedia($id: ID!) {
    finalizeMediaUpload(input: { mediaItemId: $id }) {
      mediaItemId
      status
    }
  }
`;

const addMediaToAlbumMutation = `
  mutation AddMediaItemToAlbum($albumId: ID!, $mediaItemId: ID!) {
    AddMediaItemToAlbum(input: { albumId: $albumId, mediaItemId: $mediaItemId }) {
      albumId
      albumItemId
    }
  }
`;

type AddMediaItemToAlbumMutationData = {
  AddMediaItemToAlbum?: { albumId: string; albumItemId: string };
};

const viewerAlbumsWithItemsQuery = `
  query ViewerAlbumsWithItems {
    viewer {
      id
      albums {
        id
        title
        items {
          id
          mediaItem {
            id
            status
          }
        }
      }
    }
  }
`;

const insertViewerRoleMember = async (
  database: Knex,
  albumId: string,
  userId: string,
): Promise<void> => {
  const now = new Date();
  await database('albumMember').insert({
    id: randomUUID(),
    albumId,
    userId,
    role: 'viewer',
    createdAt: now,
    updatedAt: now,
    createdBy: TEST_VIEWER_A_ID,
    updatedBy: TEST_VIEWER_A_ID,
  });
};

const createReadyMediaItemViaGraphQL = async (params: {
  executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
  database: Knex;
  mediaStorageRoot: string;
  context?: Record<string, unknown>;
}): Promise<string> => {
  const { executeGraphQL, database, mediaStorageRoot, context = loggedInViewer1 } = params;

  const created = await executeGraphQL<{ createMediaUpload: { mediaItemId: string } }>({
    query: createMediaUploadMutation,
    context,
  });
  expect(created.json.errors).toBeUndefined();
  const mediaItemId = created.json.data?.createMediaUpload.mediaItemId;
  expect(mediaItemId).toBeTruthy();
  if (!mediaItemId) {
    throw new Error('expected mediaItemId');
  }

  await writeLocalMediaObjectBytesForIntegrationTest(
    database,
    mediaStorageRoot,
    mediaItemId,
    Buffer.from('jpeg-bytes'),
  );

  const finalized = await executeGraphQL<{
    finalizeMediaUpload: { mediaItemId: string; status: string };
  }>({
    query: finalizeMediaUploadMutation,
    variables: { id: mediaItemId },
    context,
  });
  expect(finalized.json.errors).toBeUndefined();
  expect(finalized.json.data?.finalizeMediaUpload.status).toBe('READY');

  return mediaItemId;
};

describe('addAlbumItem', () => {
  let executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
  let container: AwilixContainer<IocGeneratedCradle>;
  let database: Knex;
  let mediaStorageRoot: string;

  beforeAll(async () => {
    const setup = await setupGraphqlIntegrationTests();
    container = setup.container;
    executeGraphQL = setup.executeGraphQL;
    database = container.resolve('database');
    mediaStorageRoot = container.resolve('config').mediaStorageRoot;
  });

  afterEach(async () => {
    await resetIntegrationTestDb(database, mediaStorageRoot);
  });

  describe('When the viewer is the album owner and owns a ready media item', () => {
    it('should add the media item to the album and return it from a follow-up viewer albums query', async () => {
      const albumTitle = `integration-album-${randomUUID()}`;

      const albumResult = await executeGraphQL<{ createAlbum: { albumId: string } }>({
        query: createAlbumMutation,
        variables: { title: albumTitle },
        context: loggedInViewer1,
      });
      expect(albumResult.json.errors).toBeUndefined();
      const albumId = albumResult.json.data?.createAlbum.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      const mediaItemId = await createReadyMediaItemViaGraphQL({
        executeGraphQL,
        database,
        mediaStorageRoot,
        context: loggedInViewer1,
      });

      const addResult = await executeGraphQL<{
        AddMediaItemToAlbum: { albumId: string; albumItemId: string };
      }>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(addResult.json.errors).toBeUndefined();
      expect(addResult.json.data?.AddMediaItemToAlbum.albumId).toBe(albumId);
      expect(addResult.json.data?.AddMediaItemToAlbum.albumItemId).toBeTruthy();

      const queryResult = await executeGraphQL<{
        viewer: {
          id: string;
          albums: Array<{
            id: string;
            title: string;
            items: Array<{ id: string; mediaItem: { id: string; status: string } }>;
          }>;
        };
      }>({
        query: viewerAlbumsWithItemsQuery,
        context: loggedInViewer1,
      });

      expect(queryResult.json.errors).toBeUndefined();
      expect(queryResult.json.data?.viewer?.id).toBe(TEST_VIEWER_1_ID);

      const album = queryResult.json.data?.viewer?.albums.find((a) => a.id === albumId);
      expect(album).toBeDefined();
      expect(album?.title).toBe(albumTitle);
      expect(album?.items).toHaveLength(1);
      expect(album?.items[0]?.mediaItem.id).toBe(mediaItemId);
      expect(album?.items[0]?.mediaItem.status).toBe('READY');
    });
  });

  describe('When AddMediaItemToAlbum is invoked twice for the same media item', () => {
    it('should reject the second add with a duplicate error', async () => {
      const albumResult = await executeGraphQL<{ createAlbum: { albumId: string } }>({
        query: createAlbumMutation,
        variables: { title: `dup-album-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      const mediaItemId = await createReadyMediaItemViaGraphQL({
        executeGraphQL,
        database,
        mediaStorageRoot,
      });

      const first = await executeGraphQL<AddMediaItemToAlbumMutationData>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(first.json.errors).toBeUndefined();

      const second = await executeGraphQL<AddMediaItemToAlbumMutationData>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(second.json.data?.AddMediaItemToAlbum).toBeFalsy();
      expect(second.json.errors?.[0]?.message).toBe(maskedResolverErrorMessage);

      const afterDup = await executeGraphQL<{
        viewer: { albums: Array<{ id: string; items: unknown[] }> };
      }>({
        query: viewerAlbumsWithItemsQuery,
        context: loggedInViewer1,
      });
      expect(afterDup.json.errors).toBeUndefined();
      const listed = afterDup.json.data?.viewer?.albums.find((a) => a.id === albumId);
      expect(listed?.items).toHaveLength(1);
    });
  });

  describe('When the media item is still pending upload', () => {
    it('should reject the add with a not-ready error', async () => {
      const albumResult = await executeGraphQL<{ createAlbum: { albumId: string } }>({
        query: createAlbumMutation,
        variables: { title: `pending-album-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      const created = await executeGraphQL<{ createMediaUpload: { mediaItemId: string } }>({
        query: createMediaUploadMutation,
        context: loggedInViewer1,
      });
      const mediaItemId = created.json.data?.createMediaUpload.mediaItemId;
      expect(mediaItemId).toBeTruthy();
      if (!mediaItemId) {
        return;
      }

      const add = await executeGraphQL<AddMediaItemToAlbumMutationData>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(add.json.data?.AddMediaItemToAlbum).toBeFalsy();
      expect(add.json.errors?.[0]?.message).toBe(maskedResolverErrorMessage);

      const row = await database('albumItem').where({ albumId }).count('* as c').first();
      expect(Number((row as { c?: string | number })?.c ?? 0)).toBe(0);
    });
  });

  describe('When the media item belongs to another user', () => {
    it('should reject the add without exposing the item to the viewer', async () => {
      const albumResult = await executeGraphQL<{ createAlbum: { albumId: string } }>({
        query: createAlbumMutation,
        variables: { title: `cross-owner-album-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      const otherUsersMediaId = await createReadyMediaItemViaGraphQL({
        executeGraphQL,
        database,
        mediaStorageRoot,
        context: loggedInViewerA,
      });

      const add = await executeGraphQL<AddMediaItemToAlbumMutationData>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId: otherUsersMediaId },
        context: loggedInViewer1,
      });
      expect(add.json.data?.AddMediaItemToAlbum).toBeFalsy();
      expect(add.json.errors?.[0]?.message).toBe(maskedResolverErrorMessage);
    });
  });

  describe('When the viewer is only an album member with the viewer role', () => {
    it('should reject the add for insufficient album role', async () => {
      const albumResult = await executeGraphQL<{ createAlbum: { albumId: string } }>({
        query: createAlbumMutation,
        variables: { title: `viewer-role-album-${randomUUID()}` },
        context: loggedInViewerA,
      });
      const albumId = albumResult.json.data?.createAlbum.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      await insertViewerRoleMember(database, albumId, TEST_VIEWER_1_ID);

      const mediaItemId = await createReadyMediaItemViaGraphQL({
        executeGraphQL,
        database,
        mediaStorageRoot,
        context: loggedInViewer1,
      });

      const add = await executeGraphQL<AddMediaItemToAlbumMutationData>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(add.json.data?.AddMediaItemToAlbum).toBeFalsy();
      expect(add.json.errors?.[0]?.message).toBe(maskedResolverErrorMessage);
    });
  });

  describe('When the album id does not exist', () => {
    it('should reject the add with album not found', async () => {
      const mediaItemId = await createReadyMediaItemViaGraphQL({
        executeGraphQL,
        database,
        mediaStorageRoot,
      });

      const add = await executeGraphQL<AddMediaItemToAlbumMutationData>({
        query: addMediaToAlbumMutation,
        variables: { albumId: missingAlbumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(add.json.data?.AddMediaItemToAlbum).toBeFalsy();
      expect(add.json.errors?.[0]?.message).toBe(maskedResolverErrorMessage);
    });
  });

  describe('When the media item id does not exist for the viewer', () => {
    it('should reject the add with media item not found', async () => {
      const albumResult = await executeGraphQL<{ createAlbum: { albumId: string } }>({
        query: createAlbumMutation,
        variables: { title: `missing-media-album-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      const add = await executeGraphQL<AddMediaItemToAlbumMutationData>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId: missingMediaItemId },
        context: loggedInViewer1,
      });
      expect(add.json.data?.AddMediaItemToAlbum).toBeFalsy();
      expect(add.json.errors?.[0]?.message).toBe(maskedResolverErrorMessage);
    });
  });
});
