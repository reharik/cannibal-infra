import { IocGeneratedCradle } from 'apps/api/src/di/generated/ioc-registry.types';
import { EntityId } from 'apps/api/src/types/types';
import { ReadServiceFactoryBase } from '../readServiceBaseType';
import {
  MediaItemCollectionInfo,
  MediaItemListProjection,
  MediaItemProjection,
} from './viewerMediaItemReadService.types';

export interface ViewerMediaItemReadService {
  listMediaItems: (collectionInfo: MediaItemCollectionInfo) => Promise<MediaItemListProjection>;
  getMediaItemForViewer: (args: {
    mediaItemId: EntityId;
  }) => Promise<MediaItemProjection | undefined>;
}

export interface ViewerMediaItemReadServiceFactory extends ReadServiceFactoryBase {
  (args: { viewerId: string }): ViewerMediaItemReadService;
}

export const buildViewerMediaItemReadServiceFactory = ({
  mediaItemReadRepository,
}: IocGeneratedCradle): ViewerMediaItemReadServiceFactory => {
  return ({ viewerId }: { viewerId: string }) => ({
    listMediaItems: async (
      collectionInfo: MediaItemCollectionInfo,
    ): Promise<MediaItemListProjection> => {
      const mediaItems = await mediaItemReadRepository.listForViewer({ viewerId, collectionInfo });
      return {
        nodes: mediaItems,
        pageInfo: collectionInfo.pageInfo,
      };
    },
    getMediaItemForViewer: async ({
      mediaItemId,
    }: {
      mediaItemId: EntityId;
    }): Promise<MediaItemProjection | undefined> => {
      return mediaItemReadRepository.getForViewer({ mediaItemId, viewerId });
    },
  });
};
