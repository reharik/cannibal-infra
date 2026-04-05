import { authenticatedResolver } from '../../context/authenticatedContext';
import type { Resolvers } from '../../generated/types.generated';
import { AlbumParent, ViewerParent } from '../parentModels';

const viewerResolvers: Pick<Resolvers, 'Query' | 'Viewer'> = {
  Query: {
    viewer: (_p, _a, ctx): ViewerParent | undefined => {
      return ctx.viewer;
    },
  },

  Viewer: {
    albums: authenticatedResolver(async (parent, _a, ctx): Promise<AlbumParent[]> => {
      return (await ctx.readServices.viewerAlbumReadService.listAlbums()) || [];
    }),
  },
};

export default viewerResolvers;
