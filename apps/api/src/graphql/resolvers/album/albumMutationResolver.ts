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

      return {
        data: result.success ? { albumId: result.value.albumId } : undefined,
        errors: result.success ? [] : [result.error],
      };
    }),
    AddMediaItemToAlbum: authenticatedResolver(async (_parent, args, ctx) => {
      const result = await ctx.writeServices.addAlbumItem({
        viewerId: ctx.viewer.id,
        albumId: args.input.albumId,
        mediaItemId: args.input.mediaItemId,
      });

      return {
        data: result.success
          ? {
              albumId: result.value.albumId,
              albumItemId: result.value.albumItemId,
            }
          : undefined,
        errors: result.success ? [] : [result.error],
      };
    }),
  },
};

export default albumResolvers;
