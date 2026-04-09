import { describe, expect, it, jest } from '@jest/globals';
import { AlbumItemSortBy, AlbumSortBy, SortDir } from '@packages/contracts';
import { buildViewerAlbumReadServiceFactory } from '../application/readServices/viewerReadServices/viewerAlbumReadService';
import type {
  AlbumCollectionInfo,
  AlbumItemCollectionInfo,
  AlbumWithCoverRow,
  AlbumItemWithMediaRow,
} from '../application/readServices/viewerReadServices/viewerAlbumReadService.types';
import type { AlbumReadRepository } from '../repositories/readRepositories/albumReadRepository';
import { CollectionInfo } from '../types/types';

describe('ViewerAlbumReadService (collection paging)', () => {
  const viewerId = 'viewer-paging-1';
  const albumId = 'album-paging-1';

  describe('When listAlbums is called with no collectionInfo fields', () => {
    it('should pass default paging and sort to the repository and echo pageInfo in the projection', async () => {
      const listByViewerId = jest.fn(
        async (_params: {
          viewerId: string;
          collectionInfo: CollectionInfo<AlbumSortBy>;
        }): Promise<AlbumWithCoverRow[]> => [],
      );
      const albumReadRepository: Pick<AlbumReadRepository, 'listByViewerId'> = {
        listByViewerId,
      };

      const factory = buildViewerAlbumReadServiceFactory({
        albumReadRepository,
      } as never);
      const service = factory({ viewerId });

      const result = await service.listAlbums({} as AlbumCollectionInfo);

      expect(listByViewerId).toHaveBeenCalledWith(
        expect.objectContaining({
          viewerId,
          collectionInfo: {},
        }),
      );
      expect(result.pageInfo).toBeUndefined();
      expect(result.nodes).toEqual([]);
    });
  });

  describe('When listAlbums is called with explicit paging', () => {
    it('should forward resolved pageInfo and sort options to the repository', async () => {
      const listByViewerId = jest.fn(
        async (_params: {
          viewerId: string;
          collectionInfo: CollectionInfo<AlbumSortBy>;
        }): Promise<AlbumWithCoverRow[]> => [],
      );
      const albumReadRepository: Pick<AlbumReadRepository, 'listByViewerId'> = {
        listByViewerId,
      };

      const factory = buildViewerAlbumReadServiceFactory({
        albumReadRepository,
      } as never);
      const service = factory({ viewerId });

      const gqlCollection: AlbumCollectionInfo = {
        pageInfo: { limit: 7, offset: 14 },
        sortBy: AlbumSortBy.title,
        sortDir: SortDir.desc,
      };

      const result = await service.listAlbums(gqlCollection);

      expect(listByViewerId).toHaveBeenCalledWith({
        viewerId,
        collectionInfo: gqlCollection,
      });
      expect(result.pageInfo).toEqual(gqlCollection.pageInfo);
    });
  });

  describe('When listAlbums returns albums without cover media', () => {
    it('should omit coverMedia on each node', async () => {
      const albumWithoutCover: AlbumWithCoverRow = {
        id: 'album-no-cover',
        title: 'No Cover',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        mediaItemId: null,
        mediaItemOwnerId: null,
        mediaItemKind: null,
        mediaItemStatus: null,
        mediaItemStorageKey: null,
        mediaItemMimeType: null,
        mediaItemSizeBytes: null,
        mediaItemWidth: null,
        mediaItemHeight: null,
        mediaItemDurationSeconds: null,
        mediaItemTitle: null,
        mediaItemDescription: null,
        mediaItemTakenAt: null,
        mediaItemCreatedAt: null,
        mediaItemUpdatedAt: null,
      };

      const listByViewerId = jest.fn(
        async (_params: {
          viewerId: string;
          collectionInfo: CollectionInfo<AlbumSortBy>;
        }): Promise<AlbumWithCoverRow[]> => [albumWithoutCover],
      );
      const albumReadRepository: Pick<AlbumReadRepository, 'listByViewerId'> = {
        listByViewerId,
      };

      const factory = buildViewerAlbumReadServiceFactory({
        albumReadRepository,
      } as never);
      const service = factory({ viewerId });

      const gqlCollection: AlbumCollectionInfo = {
        pageInfo: { limit: 10, offset: 0 },
        sortBy: AlbumSortBy.title,
        sortDir: SortDir.asc,
      };

      const result = await service.listAlbums(gqlCollection);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]?.coverMedia).toBeUndefined();
    });
  });

  describe('When getAlbumItems is called with no collectionInfo fields', () => {
    it('should pass default paging and sort to the repository and echo pageInfo in the projection', async () => {
      const getAlbumItemsForViewer = jest.fn(
        async (_params: {
          albumId: string;
          viewerId: string;
          collectionInfo: CollectionInfo<AlbumSortBy>;
        }): Promise<AlbumItemWithMediaRow[]> => [],
      );
      const albumReadRepository: Pick<AlbumReadRepository, 'getAlbumItemsForViewer'> = {
        getAlbumItemsForViewer,
      };

      const factory = buildViewerAlbumReadServiceFactory({
        albumReadRepository,
      } as never);
      const service = factory({ viewerId });

      const result = await service.getAlbumItems({
        albumId,
        collectionInfo: {} as AlbumItemCollectionInfo,
      });

      expect(getAlbumItemsForViewer).toHaveBeenCalledWith(
        expect.objectContaining({
          albumId,
          viewerId,
          collectionInfo: {},
        }),
      );
      expect(result.pageInfo).toBeUndefined();
      expect(result.nodes).toEqual([]);
    });
  });

  describe('When getAlbumItems is called with explicit paging', () => {
    it('should forward resolved pageInfo and sort options to the repository', async () => {
      const getAlbumItemsForViewer = jest.fn(
        async (_params: {
          albumId: string;
          viewerId: string;
          collectionInfo: CollectionInfo<AlbumSortBy>;
        }): Promise<AlbumItemWithMediaRow[]> => [],
      );
      const albumReadRepository: Pick<AlbumReadRepository, 'getAlbumItemsForViewer'> = {
        getAlbumItemsForViewer,
      };

      const factory = buildViewerAlbumReadServiceFactory({
        albumReadRepository,
      } as never);
      const service = factory({ viewerId });

      const gqlCollection: AlbumItemCollectionInfo = {
        pageInfo: { limit: 4, offset: 8 },
        sortBy: AlbumItemSortBy.createdAt,
        sortDir: SortDir.asc,
      };

      const result = await service.getAlbumItems({ albumId, collectionInfo: gqlCollection });

      expect(getAlbumItemsForViewer).toHaveBeenCalledWith({
        albumId,
        viewerId,
        collectionInfo: gqlCollection,
      });
      expect(result.pageInfo).toEqual(gqlCollection.pageInfo);
    });
  });
});
