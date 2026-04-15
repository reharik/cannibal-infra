import { authenticatedResolver } from '../../context/authenticatedContext';
import type { Resolvers } from '../../generated/types.generated';

const mediaItemResolvers: Pick<Resolvers, 'MediaItem'> = {
  MediaItem: {
    derivedUrls: authenticatedResolver(async (mediaItem, _args, ctx) => {
      return ctx.readServices.viewerMediaItemReadService.getDerivedUrlsForMediaItem({
        mediaItemStorageKey: mediaItem.storageKey,
      });
    }),
  },
};

export default mediaItemResolvers;
