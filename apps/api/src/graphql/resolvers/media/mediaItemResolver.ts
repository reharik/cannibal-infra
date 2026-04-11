import { MediaAssetKind } from '@packages/contracts';
import { authenticatedResolver } from '../../context/authenticatedContext';
import type { Resolvers } from '../../generated/types.generated';

const mediaItemResolvers: Pick<Resolvers, 'MediaItem'> = {
  MediaItem: {
    asset: authenticatedResolver(async (mediaItem, { kind }, ctx) => {
      const requestedKind =
        kind === MediaAssetKind.display.value
          ? MediaAssetKind.display
          : kind === MediaAssetKind.thumbnail.value
            ? MediaAssetKind.thumbnail
            : MediaAssetKind.original;
      return ctx.readServices.viewerMediaItemReadService.getAssetForMediaItem({
        mediaItemId: mediaItem.id,
        mediaItemStorageKey: mediaItem.storageKey,
        requestedKind,
      });
    }),
    assets: authenticatedResolver(async (mediaItem, _args, ctx) => {
      return ctx.readServices.viewerMediaItemReadService.getAssetsForMediaItem({
        mediaItemId: mediaItem.id,
        mediaItemStorageKey: mediaItem.storageKey,
      });
    }),
  },
};

export default mediaItemResolvers;
