import { authenticatedMutation } from '../../context/authenticatedContext';
import type { Resolvers } from '../../generated/types.generated';
import { AlbumParent, ViewerParent } from '../parentModels';

const viewerResolvers: Pick<Resolvers, 'Query' | 'Viewer' | 'Album'> = {
  Query: {
    viewer: (_p, _a, ctx): ViewerParent | undefined => {
      return ctx.viewer;
    },
  },

  Viewer: {
    albums: authenticatedMutation(async (parent, _a, ctx): Promise<AlbumParent[]> => {
      return (await ctx.readServices.viewerAlbumReadService.listAlbums()) || [];
    }),
  },
};

export default viewerResolvers;
