import { randomUUID } from 'node:crypto';

import { AlbumMemberRoleEnum, AppErrorCollection } from '@packages/contracts';
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
      data {
        albumId
      }
      errors {
        code
        message
      }
    }
  }
`;

const createMediaUploadMutation = `
  mutation {
    createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
      data {
        mediaItemId
      }
      errors {
        code
        message
      }
    }
  }
`;

const finalizeMediaUploadMutation = `
  mutation FinalizeMedia($id: ID!) {
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
`;

const addMediaToAlbumMutation = `
  mutation AddMediaItemToAlbum($albumId: ID!, $mediaItemId: ID!) {
    AddMediaItemToAlbum(input: { albumId: $albumId, mediaItemId: $mediaItemId }) {
      data {
        albumId
        albumItemId
      }
      errors {
        code
        message
      }
    }
  }
`;

type ContractErrorPayload = { code: string; message: string };

type WriteMutationResponse<T> = {
  data?: T;
  errors: ContractErrorPayload[];
};

type AddMediaItemToAlbumMutationData = {
  AddMediaItemToAlbum?: WriteMutationResponse<{ albumId: string; albumItemId: string }>;
};

const listCollection = `
  collectionInfo: {
    pageInfo: { limit: 50, offset: 0 }
    sortBy: CREATED_AT
    sortDir: ASC
  }
`;

const viewerAlbumsWithItemsQuery = `
  query ViewerAlbumsWithItems {
    viewer {
      id
      albums(input: { ${listCollection} }) {
        nodes {
          id
          title
          items(input: { ${listCollection} }) {
            nodes {
              id
              mediaItem {
                id
                status
              }
            }
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
    role: AlbumMemberRoleEnum.viewer.value,
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

  const created = await executeGraphQL<{
    createMediaUpload: WriteMutationResponse<{ mediaItemId: string }>;
  }>({
    query: createMediaUploadMutation,
    context,
  });
  expect(created.json.errors).toBeUndefined();
  const mediaItemId = created.json.data?.createMediaUpload.data?.mediaItemId;
  expect(created.json.data?.createMediaUpload.errors).toEqual([]);
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
    finalizeMediaUpload: WriteMutationResponse<{ mediaItemId: string; status: string }>;
  }>({
    query: finalizeMediaUploadMutation,
    variables: { id: mediaItemId },
    context,
  });
  expect(finalized.json.errors).toBeUndefined();
  expect(finalized.json.data?.finalizeMediaUpload.errors).toEqual([]);
  expect(finalized.json.data?.finalizeMediaUpload.data?.status).toBe('READY');

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

      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: albumTitle },
        context: loggedInViewer1,
      });
      expect(albumResult.json.errors).toBeUndefined();
      expect(albumResult.json.data?.createAlbum.errors).toEqual([]);
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
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
        AddMediaItemToAlbum: WriteMutationResponse<{ albumId: string; albumItemId: string }>;
      }>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(addResult.json.errors).toBeUndefined();
      expect(addResult.json.data?.AddMediaItemToAlbum.errors).toEqual([]);
      expect(addResult.json.data?.AddMediaItemToAlbum.data?.albumId).toBe(albumId);
      expect(addResult.json.data?.AddMediaItemToAlbum.data?.albumItemId).toBeTruthy();

      const albumRow = await database('album').where({ id: albumId }).first();
      expect(albumRow?.title).toBe(albumTitle);

      const albumItems = await database('albumItem').where({ albumId, mediaItemId });
      expect(albumItems).toHaveLength(1);

      const mediaItemRow = await database('mediaItem').where({ id: mediaItemId }).first();
      expect(String(mediaItemRow?.status ?? '').toUpperCase()).toBe('READY');
    });
  });

  describe('When AddMediaItemToAlbum is invoked twice for the same media item', () => {
    it('should reject the second add with a duplicate error', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `dup-album-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
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
      expect(first.json.data?.AddMediaItemToAlbum.errors).toEqual([]);

      const second = await executeGraphQL<AddMediaItemToAlbumMutationData>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(second.json.errors).toBeUndefined();
      expect(second.json.data?.AddMediaItemToAlbum.data).toBeFalsy();
      expect(second.json.data?.AddMediaItemToAlbum.errors[0]?.code).toBe(
        AppErrorCollection.album.MediaAlreadyInAlbum.code,
      );

      const albumItems = await database('albumItem').where({ albumId, mediaItemId });
      expect(albumItems).toHaveLength(1);
    });
  });

  describe('When the media item is still pending upload', () => {
    it('should reject the add with a not-ready error', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `pending-album-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      const created = await executeGraphQL<{
        createMediaUpload: WriteMutationResponse<{ mediaItemId: string }>;
      }>({
        query: createMediaUploadMutation,
        context: loggedInViewer1,
      });
      const mediaItemId = created.json.data?.createMediaUpload.data?.mediaItemId;
      expect(mediaItemId).toBeTruthy();
      if (!mediaItemId) {
        return;
      }

      const add = await executeGraphQL<AddMediaItemToAlbumMutationData>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(add.json.errors).toBeUndefined();
      expect(add.json.data?.AddMediaItemToAlbum.data).toBeFalsy();
      expect(add.json.data?.AddMediaItemToAlbum.errors[0]?.code).toBe(
        AppErrorCollection.mediaItem.MediaItemNotReady.code,
      );

      const row = await database('albumItem').where({ albumId }).count('* as c').first();
      expect(Number((row as { c?: string | number })?.c ?? 0)).toBe(0);
    });
  });

  describe('When the media item belongs to another user', () => {
    it('should reject the add without exposing the item to the viewer', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `cross-owner-album-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
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
      expect(add.json.errors).toBeUndefined();
      expect(add.json.data?.AddMediaItemToAlbum.data).toBeFalsy();
      expect(add.json.data?.AddMediaItemToAlbum.errors[0]?.code).toBe(
        AppErrorCollection.mediaItem.MediaItemNotFound.code,
      );
    });
  });

  describe('When the viewer is only an album member with the viewer role', () => {
    it('should reject the add for insufficient album role', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `viewer-role-album-${randomUUID()}` },
        context: loggedInViewerA,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
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
      expect(add.json.errors).toBeUndefined();
      expect(add.json.data?.AddMediaItemToAlbum.data).toBeFalsy();
      expect(add.json.data?.AddMediaItemToAlbum.errors[0]?.code).toBe(
        AppErrorCollection.album.MemberNotAllowedToAddItem.code,
      );
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
      expect(add.json.errors).toBeUndefined();
      expect(add.json.data?.AddMediaItemToAlbum.data).toBeFalsy();
      expect(add.json.data?.AddMediaItemToAlbum.errors[0]?.code).toBe(
        AppErrorCollection.album.AlbumNotFound.code,
      );
    });
  });

  describe('When the media item id does not exist for the viewer', () => {
    it('should reject the add with media item not found', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `missing-media-album-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      const add = await executeGraphQL<AddMediaItemToAlbumMutationData>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId: missingMediaItemId },
        context: loggedInViewer1,
      });
      expect(add.json.errors).toBeUndefined();
      expect(add.json.data?.AddMediaItemToAlbum.data).toBeFalsy();
      expect(add.json.data?.AddMediaItemToAlbum.errors[0]?.code).toBe(
        AppErrorCollection.mediaItem.MediaItemNotFound.code,
      );
    });
  });

  describe('When viewer.album is queried', () => {
    const viewerAlbumByIdQuery = `
      query ViewerAlbumById($albumId: ID!) {
        viewer {
          id
          album(id: $albumId) {
            id
            title
            items(input: { ${listCollection} }) {
              nodes {
                id
                mediaItem {
                  id
                }
              }
            }
          }
        }
      }
    `;

    it('should return the album id, title, and item list for a viewer album', async () => {
      const albumTitle = `viewer-album-by-id-${randomUUID()}`;
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: albumTitle },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
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

      await executeGraphQL<AddMediaItemToAlbumMutationData>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });

      const q = await executeGraphQL<{
        viewer?: {
          album?: {
            id: string;
            title: string;
            items: { nodes: Array<{ id: string; mediaItem: { id: string } }> };
          } | null;
        };
      }>({
        query: viewerAlbumByIdQuery,
        variables: { albumId },
        context: loggedInViewer1,
      });
      expect(q.json.errors).toBeUndefined();
      expect(q.json.data?.viewer?.album?.id).toBe(albumId);
      expect(q.json.data?.viewer?.album?.title).toBe(albumTitle);
      expect(q.json.data?.viewer?.album?.items.nodes).toHaveLength(1);
      expect(q.json.data?.viewer?.album?.items.nodes[0]?.mediaItem.id).toBe(mediaItemId);
    });

    it('should return null when the album is not visible to the viewer', async () => {
      const q = await executeGraphQL<{
        viewer?: { album?: { id: string } | null };
      }>({
        query: viewerAlbumByIdQuery,
        variables: { albumId: missingAlbumId },
        context: loggedInViewer1,
      });
      expect(q.json.errors).toBeUndefined();
      expect(q.json.data?.viewer?.album).toBeNull();
    });
  });
});
