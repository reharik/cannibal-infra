import { authenticatedResolver } from '../../context/authenticatedContext';
import type { Resolvers } from '../../generated/types.generated';

const albumResolvers: Pick<Resolvers, 'Mutation'> = {
  Mutation: {
    createAlbum: authenticatedResolver(async (_parent, args, ctx) => {
      const result = await ctx.writeServices.createAlbum({
        viewerId: ctx.viewer.id,
        title: args.input.title,
        description: args.input.description,
      });

      if (!result.success) {
        throw new Error(result.error.message);
      }

      return {
        albumId: result.value.albumId,
      };
    }),
    AddMediaItemToAlbum: authenticatedResolver(async (_parent, args, ctx) => {
      const result = await ctx.writeServices.addAlbumItem({
        viewerId: ctx.viewer.id,
        albumId: args.input.albumId,
        mediaItemId: args.input.mediaItemId,
      });

      if (!result.success) {
        throw new Error(result.error.message);
      }

      return {
        albumId: result.value.albumId,
        albumItemId: result.value.albumItemId,
      };
    }),
  },
};

export default albumResolvers;
