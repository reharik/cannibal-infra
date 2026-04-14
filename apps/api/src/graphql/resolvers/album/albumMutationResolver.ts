import { authenticatedResolver } from '../../context/authenticatedContext';
import type { Resolvers } from '../../generated/types.generated';
import { toContractErrorPayload } from '../../mappers/contractErrorMapper';

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
        errors: result.success ? [] : [toContractErrorPayload(result.error)],
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
        errors: result.success ? [] : [toContractErrorPayload(result.error)],
      };
    }),
    DeleteAlbumItemFromAlbum: authenticatedResolver(async (_parent, args, ctx) => {
      const result = await ctx.writeServices.deleteAlbumItem({
        viewerId: ctx.viewer.id,
        albumId: args.input.albumId,
        mediaItemId: args.input.mediaItemId,
      });

      return {
        data: result.success
          ? {
              albumId: result.value.albumId,
              mediaItemId: result.value.mediaItemId,
            }
          : undefined,
        errors: result.success ? [] : [toContractErrorPayload(result.error)],
      };
    }),

    SetCoverMedia: authenticatedResolver(async (_parent, args, ctx) => {
      const result = await ctx.writeServices.setCoverMedia({
        viewerId: ctx.viewer.id,
        albumId: args.input.albumId,
        mediaItemId: args.input.mediaItemId,
      });
      return {
        data: result.success
          ? {
              albumId: result.value.albumId,
              mediaCoverId: result.value.mediaCoverId,
            }
          : undefined,
        errors: result.success ? [] : [toContractErrorPayload(result.error)],
      };
    }),
    UnsetCoverMedia: authenticatedResolver(async (_parent, args, ctx) => {
      const result = await ctx.writeServices.unsetCoverMedia({
        viewerId: ctx.viewer.id,
        albumId: args.input.albumId,
      });
      return {
        data: result.success
          ? {
              albumId: result.value.albumId,
            }
          : undefined,
        errors: result.success ? [] : [toContractErrorPayload(result.error)],
      };
    }),
  },
};

export default albumResolvers;
