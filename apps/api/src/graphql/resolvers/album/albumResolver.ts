import { authenticatedResolver } from '../../context/authenticatedContext';
import type { Resolvers } from '../../generated/types.generated';

const albumResolvers: Resolvers = {
  Album: {
    items: authenticatedResolver(async (album, _args, ctx) => {
      return ctx.readServices.viewerAlbumReadService.getAlbumItems({
        albumId: album.id,
      });
    }),
  },
};

export default albumResolvers;
