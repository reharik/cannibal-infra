import { IocGeneratedCradle } from 'apps/api/src/di/generated/ioc-registry.types';
import { EntityId } from 'apps/api/src/types/types';
import { ReadServiceFactoryBase } from '../readServiceBaseType';

type MediaItemRow = {
  id: string;
  kind: string;
  status: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
};

export interface ViewerMediaItemService {
  getMediaItemForViewer: (args: { mediaItemId: EntityId }) => Promise<MediaItemRow | undefined>;
}

export interface ViewerMediaItemServiceFactory extends ReadServiceFactoryBase {
  (args: { viewerId: string }): ViewerMediaItemService;
}

export const buildViewerMediaItemServiceFactory = ({
  mediaItemReadRepository,
}: IocGeneratedCradle): ViewerMediaItemServiceFactory => {
  return ({ viewerId }: { viewerId: string }) => ({
    getMediaItemForViewer: async ({
      mediaItemId,
    }: {
      mediaItemId: EntityId;
    }): Promise<MediaItemRow | undefined> => {
      return mediaItemReadRepository.getForViewer({ mediaItemId, viewerId });
    },
  });
};
