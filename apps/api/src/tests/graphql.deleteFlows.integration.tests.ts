import { randomUUID } from 'node:crypto';

import { AlbumMemberRoleEnum, AppErrorCollection, MediaItemStatus } from '@packages/contracts';
import type { AwilixContainer } from 'awilix';
import type { Knex } from 'knex';

import type { IocGeneratedCradle } from '../di/generated/ioc-registry.types';
import { createExecuteGraphQL } from './executeGQL';
import { setupGraphqlIntegrationTests } from './graphqlIntegrationTestSetup';
import {
  MINIMAL_PNG_1X1,
  seedIntegrationTestUploadedObject,
} from './integrationMediaObjectTestHelper';
import type { IntegrationTestMediaStorage } from './integrationTestMediaStorage';
import { resetIntegrationTestDb } from './resetDb';
import { TEST_VIEWER_1_ID, TEST_VIEWER_A_ID } from './testViewerIds';

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

type ContractErrorPayload = { code: string; message: string };

type WriteMutationResponse<T> = {
  data?: T;
  errors: ContractErrorPayload[];
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
    createMediaUpload(input: { kind: PHOTO, mimeType: "image/png" }) {
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

const deleteAlbumItemMutation = `
  mutation DeleteAlbumItemFromAlbum($albumId: ID!, $mediaItemId: ID!) {
    DeleteAlbumItemFromAlbum(input: { albumId: $albumId, mediaItemId: $mediaItemId }) {
      data {
        albumId
        mediaItemId
      }
      errors {
        code
        message
      }
    }
  }
`;

const deleteAlbumMutation = `
  mutation DeleteAlbum($albumId: ID!) {
    deleteAlbum(input: { albumId: $albumId }) {
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

const deleteMediaItemMutation = `
  mutation DeleteMediaItem($mediaItemId: ID!) {
    deleteMediaItem(input: { mediaItemId: $mediaItemId }) {
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

const listCollection = `
  collectionInfo: {
    pageInfo: { limit: 50, offset: 0 }
    sortBy: CREATED_AT
    sortDir: ASC
  }
`;

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

const insertAlbumMember = async (
  database: Knex,
  albumId: string,
  userId: string,
  role: (typeof AlbumMemberRoleEnum)[keyof typeof AlbumMemberRoleEnum],
): Promise<void> => {
  const now = new Date();
  await database('albumMember').insert({
    id: randomUUID(),
    albumId,
    userId,
    role: role.value,
    createdAt: now,
    updatedAt: now,
    createdBy: TEST_VIEWER_A_ID,
    updatedBy: TEST_VIEWER_A_ID,
  });
};

/** For cases where AddMediaItemToAlbum is not allowed (e.g. viewer role). */
const insertAlbumItem = async (
  database: Knex,
  albumId: string,
  mediaItemId: string,
): Promise<void> => {
  const now = new Date();
  await database('albumItem').insert({
    id: randomUUID(),
    albumId,
    mediaItemId,
    createdAt: now,
    updatedAt: now,
    createdBy: TEST_VIEWER_A_ID,
    updatedBy: TEST_VIEWER_A_ID,
  });
};

const createUploadedMediaItemViaGraphQL = async (params: {
  executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
  database: Knex;
  integrationTestMediaStorage: IntegrationTestMediaStorage;
  context?: Record<string, unknown>;
}): Promise<string> => {
  const {
    executeGraphQL,
    database,
    integrationTestMediaStorage,
    context = loggedInViewer1,
  } = params;

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

  await seedIntegrationTestUploadedObject(
    database,
    integrationTestMediaStorage,
    mediaItemId,
    MINIMAL_PNG_1X1,
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
  expect(finalized.json.data?.finalizeMediaUpload.data?.status).toBe(
    MediaItemStatus.uploaded.value,
  );

  return mediaItemId;
};

describe('DeleteAlbumItemFromAlbum', () => {
  let executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
  let container: AwilixContainer<IocGeneratedCradle>;
  let database: Knex;
  let integrationTestMediaStorage: IntegrationTestMediaStorage;

  beforeAll(async () => {
    const setup = await setupGraphqlIntegrationTests();
    container = setup.container;
    executeGraphQL = setup.executeGraphQL;
    database = container.resolve('database');
    integrationTestMediaStorage = setup.integrationTestMediaStorage;
  });

  afterEach(async () => {
    await resetIntegrationTestDb(database, undefined, () => integrationTestMediaStorage.clear());
  });

  describe('When the actor is an owner deleting an item that exists in the album', () => {
    it('should succeed and remove the album item from subsequent reads', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `del-item-owner-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      const mediaItemId = await createUploadedMediaItemViaGraphQL({
        executeGraphQL,
        database,
        integrationTestMediaStorage,
      });

      const add = await executeGraphQL<{
        AddMediaItemToAlbum: WriteMutationResponse<{ albumId: string; albumItemId: string }>;
      }>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(add.json.data?.AddMediaItemToAlbum.errors).toEqual([]);
      const albumItemIdFromAdd = add.json.data?.AddMediaItemToAlbum.data?.albumItemId;
      expect(albumItemIdFromAdd).toBeTruthy();

      const del = await executeGraphQL<{
        DeleteAlbumItemFromAlbum: WriteMutationResponse<{ albumId: string; mediaItemId: string }>;
      }>({
        query: deleteAlbumItemMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(del.json.errors).toBeUndefined();
      expect(del.json.data?.DeleteAlbumItemFromAlbum.errors).toEqual([]);
      expect(del.json.data?.DeleteAlbumItemFromAlbum.data?.albumId).toBe(albumId);
      expect(del.json.data?.DeleteAlbumItemFromAlbum.data?.mediaItemId).toBe(mediaItemId);

      const rows = await database('albumItem').where({ albumId, mediaItemId });
      expect(rows).toHaveLength(0);

      const q = await executeGraphQL<{
        viewer?: {
          album?: { items: { nodes: Array<{ mediaItem: { id: string } }> } };
        };
      }>({
        query: viewerAlbumByIdQuery,
        variables: { albumId },
        context: loggedInViewer1,
      });
      expect(q.json.data?.viewer?.album?.items.nodes ?? []).toHaveLength(0);
    });
  });

  describe('When the actor is an album admin (non-owner)', () => {
    it('should succeed', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `del-item-admin-${randomUUID()}` },
        context: loggedInViewerA,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      await insertAlbumMember(database, albumId, TEST_VIEWER_1_ID, AlbumMemberRoleEnum.admin);

      const mediaItemId = await createUploadedMediaItemViaGraphQL({
        executeGraphQL,
        database,
        integrationTestMediaStorage,
      });

      /** addAlbumItem resolves media via getForViewer(mediaItemId, viewerId); only the media owner can add. */
      const addResult = await executeGraphQL<{
        AddMediaItemToAlbum: WriteMutationResponse<{ albumId: string; albumItemId: string }>;
      }>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(addResult.json.errors).toBeUndefined();
      expect(addResult.json.data?.AddMediaItemToAlbum.errors).toEqual([]);

      const del = await executeGraphQL<{
        DeleteAlbumItemFromAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: deleteAlbumItemMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(del.json.errors).toBeUndefined();
      expect(del.json.data?.DeleteAlbumItemFromAlbum.errors).toEqual([]);
      expect(del.json.data?.DeleteAlbumItemFromAlbum.data?.albumId).toBe(albumId);
    });
  });

  describe('When the actor is only a viewer member', () => {
    it('should fail with member not allowed to delete item', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `del-item-viewer-role-${randomUUID()}` },
        context: loggedInViewerA,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      await insertAlbumMember(database, albumId, TEST_VIEWER_1_ID, AlbumMemberRoleEnum.viewer);

      const mediaItemId = await createUploadedMediaItemViaGraphQL({
        executeGraphQL,
        database,
        integrationTestMediaStorage,
      });

      /** Viewers cannot add items; seed album_item as if an admin had added the media. */
      await insertAlbumItem(database, albumId, mediaItemId);

      const del = await executeGraphQL<{
        DeleteAlbumItemFromAlbum: WriteMutationResponse<unknown>;
      }>({
        query: deleteAlbumItemMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(del.json.errors).toBeUndefined();
      expect(del.json.data?.DeleteAlbumItemFromAlbum.data).toBeFalsy();
      expect(del.json.data?.DeleteAlbumItemFromAlbum.errors[0]?.code).toBe(
        AppErrorCollection.album.MemberNotAllowedToDeleteItem.code,
      );
    });
  });

  describe('When the actor is not an album member', () => {
    it('should fail with user is not a member', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `del-item-not-member-${randomUUID()}` },
        context: loggedInViewerA,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      /** Album owner must own the media to add (getForViewer uses caller id and media owner). */
      const mediaItemId = await createUploadedMediaItemViaGraphQL({
        executeGraphQL,
        database,
        integrationTestMediaStorage,
        context: loggedInViewerA,
      });

      const addResult = await executeGraphQL<{
        AddMediaItemToAlbum: WriteMutationResponse<unknown>;
      }>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewerA,
      });
      expect(addResult.json.errors).toBeUndefined();
      expect(addResult.json.data?.AddMediaItemToAlbum?.errors).toEqual([]);

      const del = await executeGraphQL<{
        DeleteAlbumItemFromAlbum: WriteMutationResponse<unknown>;
      }>({
        query: deleteAlbumItemMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(del.json.errors).toBeUndefined();
      expect(del.json.data?.DeleteAlbumItemFromAlbum.data).toBeFalsy();
      expect(del.json.data?.DeleteAlbumItemFromAlbum.errors[0]?.code).toBe(
        AppErrorCollection.album.UserIsNotMember.code,
      );
    });
  });

  describe('When the media item is not in the album', () => {
    it('should fail with media item not in album', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `del-item-missing-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      const del = await executeGraphQL<{
        DeleteAlbumItemFromAlbum: WriteMutationResponse<unknown>;
      }>({
        query: deleteAlbumItemMutation,
        variables: { albumId, mediaItemId: missingMediaItemId },
        context: loggedInViewer1,
      });
      expect(del.json.errors).toBeUndefined();
      expect(del.json.data?.DeleteAlbumItemFromAlbum.data).toBeFalsy();
      expect(del.json.data?.DeleteAlbumItemFromAlbum.errors[0]?.code).toBe(
        AppErrorCollection.album.MediaItemNotInAlbum.code,
      );
    });
  });
});

describe('deleteAlbum', () => {
  let executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
  let container: AwilixContainer<IocGeneratedCradle>;
  let database: Knex;
  let integrationTestMediaStorage: IntegrationTestMediaStorage;

  beforeAll(async () => {
    const setup = await setupGraphqlIntegrationTests();
    container = setup.container;
    executeGraphQL = setup.executeGraphQL;
    database = container.resolve('database');
    integrationTestMediaStorage = setup.integrationTestMediaStorage;
  });

  afterEach(async () => {
    await resetIntegrationTestDb(database, undefined, () => integrationTestMediaStorage.clear());
  });

  describe('When the actor is the album owner', () => {
    it('should return albumId and remove the album from subsequent reads', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `delete-album-owner-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      const del = await executeGraphQL<{
        deleteAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: deleteAlbumMutation,
        variables: { albumId },
        context: loggedInViewer1,
      });
      expect(del.json.errors).toBeUndefined();
      expect(del.json.data?.deleteAlbum.errors).toEqual([]);
      expect(del.json.data?.deleteAlbum.data?.albumId).toBe(albumId);

      const row = await database('album').where({ id: albumId }).first();
      expect(row).toBeUndefined();

      const q = await executeGraphQL<{
        viewer?: { album?: { id: string } | null };
      }>({
        query: viewerAlbumByIdQuery,
        variables: { albumId },
        context: loggedInViewer1,
      });
      expect(q.json.data?.viewer?.album).toBeNull();
    });
  });

  describe('When the actor is an admin member', () => {
    it('should succeed', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `delete-album-admin-${randomUUID()}` },
        context: loggedInViewerA,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      await insertAlbumMember(database, albumId, TEST_VIEWER_1_ID, AlbumMemberRoleEnum.admin);

      const del = await executeGraphQL<{
        deleteAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: deleteAlbumMutation,
        variables: { albumId },
        context: loggedInViewer1,
      });
      expect(del.json.errors).toBeUndefined();
      expect(del.json.data?.deleteAlbum.errors).toEqual([]);
      expect(del.json.data?.deleteAlbum.data?.albumId).toBe(albumId);
    });
  });

  describe('When the actor has only viewer role on the album', () => {
    it('should fail with member not allowed to delete album', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `delete-album-viewer-${randomUUID()}` },
        context: loggedInViewerA,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      await insertAlbumMember(database, albumId, TEST_VIEWER_1_ID, AlbumMemberRoleEnum.viewer);

      const del = await executeGraphQL<{
        deleteAlbum: WriteMutationResponse<unknown>;
      }>({
        query: deleteAlbumMutation,
        variables: { albumId },
        context: loggedInViewer1,
      });
      expect(del.json.errors).toBeUndefined();
      expect(del.json.data?.deleteAlbum.data).toBeFalsy();
      expect(del.json.data?.deleteAlbum.errors[0]?.code).toBe(
        AppErrorCollection.album.MemberNotAllowedToDeleteAlbum.code,
      );

      const row = await database('album').where({ id: albumId }).first();
      expect(row?.id).toBe(albumId);
    });
  });

  describe('When the album contains items and members', () => {
    it('should remove dependent album rows without leaving orphan album items', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `delete-album-deps-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      const mediaItemId = await createUploadedMediaItemViaGraphQL({
        executeGraphQL,
        database,
        integrationTestMediaStorage,
      });

      const addToAlbum = await executeGraphQL<{
        AddMediaItemToAlbum: WriteMutationResponse<{ albumId: string; albumItemId: string }>;
      }>({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });
      expect(addToAlbum.json.errors).toBeUndefined();
      expect(addToAlbum.json.data?.AddMediaItemToAlbum.errors).toEqual([]);
      expect(addToAlbum.json.data?.AddMediaItemToAlbum.data?.albumId).toBe(albumId);

      await insertAlbumMember(database, albumId, TEST_VIEWER_A_ID, AlbumMemberRoleEnum.viewer);

      await executeGraphQL<{
        deleteAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: deleteAlbumMutation,
        variables: { albumId },
        context: loggedInViewer1,
      });

      const items = await database('albumItem').where({ albumId });
      expect(items).toHaveLength(0);
      const members = await database('albumMember').where({ albumId });
      expect(members).toHaveLength(0);
    });
  });
});

describe('deleteMediaItem', () => {
  let executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
  let container: AwilixContainer<IocGeneratedCradle>;
  let database: Knex;
  let integrationTestMediaStorage: IntegrationTestMediaStorage;

  beforeAll(async () => {
    const setup = await setupGraphqlIntegrationTests();
    container = setup.container;
    executeGraphQL = setup.executeGraphQL;
    database = container.resolve('database');
    integrationTestMediaStorage = setup.integrationTestMediaStorage;
  });

  afterEach(async () => {
    await resetIntegrationTestDb(database, undefined, () => integrationTestMediaStorage.clear());
  });

  describe('When the viewer owns the media item', () => {
    it('should succeed and remove the media item row', async () => {
      const mediaItemId = await createUploadedMediaItemViaGraphQL({
        executeGraphQL,
        database,
        integrationTestMediaStorage,
      });

      const del = await executeGraphQL<{
        deleteMediaItem: WriteMutationResponse<{ mediaItemId: string }>;
      }>({
        query: deleteMediaItemMutation,
        variables: { mediaItemId },
        context: loggedInViewer1,
      });
      expect(del.json.errors).toBeUndefined();
      expect(del.json.data?.deleteMediaItem.errors).toEqual([]);
      expect(del.json.data?.deleteMediaItem.data?.mediaItemId).toBe(mediaItemId);

      const row = await database('mediaItem').where({ id: mediaItemId }).first();
      expect(row).toBeUndefined();
    });
  });

  describe('When another user attempts to delete the media item', () => {
    it('should fail with media item not owned by viewer', async () => {
      const mediaItemId = await createUploadedMediaItemViaGraphQL({
        executeGraphQL,
        database,
        integrationTestMediaStorage,
        context: loggedInViewer1,
      });

      const del = await executeGraphQL<{
        deleteMediaItem: WriteMutationResponse<unknown>;
      }>({
        query: deleteMediaItemMutation,
        variables: { mediaItemId },
        context: loggedInViewerA,
      });
      expect(del.json.errors).toBeUndefined();
      expect(del.json.data?.deleteMediaItem.data).toBeFalsy();
      expect(del.json.data?.deleteMediaItem.errors[0]?.code).toBe(
        AppErrorCollection.mediaItem.MediaItemNotOwnedByViewer.code,
      );

      const row = await database('mediaItem').where({ id: mediaItemId }).first();
      expect(row?.id).toBe(mediaItemId);
    });
  });

  describe('When the media item appears in an album and is referenced as cover', () => {
    // cover media is not implemented yet
    it.skip('should remove album item linkage and clear cover reference', async () => {
      const albumResult = await executeGraphQL<{
        createAlbum: WriteMutationResponse<{ albumId: string }>;
      }>({
        query: createAlbumMutation,
        variables: { title: `del-media-cover-${randomUUID()}` },
        context: loggedInViewer1,
      });
      const albumId = albumResult.json.data?.createAlbum.data?.albumId;
      expect(albumId).toBeTruthy();
      if (!albumId) {
        return;
      }

      const mediaItemId = await createUploadedMediaItemViaGraphQL({
        executeGraphQL,
        database,
        integrationTestMediaStorage,
      });

      await executeGraphQL({
        query: addMediaToAlbumMutation,
        variables: { albumId, mediaItemId },
        context: loggedInViewer1,
      });

      await database('album').where({ id: albumId }).update({ coverMediaId: mediaItemId });

      const del = await executeGraphQL<{
        deleteMediaItem: WriteMutationResponse<{ mediaItemId: string }>;
      }>({
        query: deleteMediaItemMutation,
        variables: { mediaItemId },
        context: loggedInViewer1,
      });
      expect(del.json.errors).toBeUndefined();
      expect(del.json.data?.deleteMediaItem.errors).toEqual([]);

      const albumRow = await database('album').where({ id: albumId }).first();
      expect(albumRow?.coverMediaId).toBeNull();

      const albumItems = await database('albumItem').where({ mediaItemId });
      expect(albumItems).toHaveLength(0);
    });
  });
});
