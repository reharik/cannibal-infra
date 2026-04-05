import { MediaKind } from '@packages/contracts';
import { GraphQLError } from 'graphql';
import { authenticatedResolver } from '../../context/authenticatedContext';
import type { Resolvers } from '../../generated/types.generated';

const writeFailureAsGraphQLError = (message: string, code: string): GraphQLError =>
  new GraphQLError(message, {
    extensions: { code },
  });

const mediaUploadResolvers: Pick<Resolvers, 'Mutation'> = {
  Mutation: {
    createMediaUpload: authenticatedResolver(async (_parent, args, ctx) => {
      const result = await ctx.writeServices.createMediaUpload({
        viewerId: ctx.viewer.id,
        kind: MediaKind.fromValue(args.input.kind),
        mimeType: args.input.mimeType,
      });

      if (!result.success) {
        throw writeFailureAsGraphQLError(result.error.message, result.error.code);
      }

      return {
        mediaItemId: result.value.mediaItemId,
        status: result.value.status.value,
        uploadInstructions: {
          method: result.value.uploadTarget.method,
          url: result.value.uploadTarget.url,
          headers: Object.entries(result.value.uploadTarget.headers ?? {}).map(([key, value]) => ({
            key,
            value,
          })),
        },
      };
    }),
    finalizeMediaUpload: authenticatedResolver(async (_parent, args, ctx) => {
      const result = await ctx.writeServices.finalizeMediaItemUpload({
        viewerId: ctx.viewer.id,
        mediaItemId: args.input.mediaItemId,
      });

      if (!result.success) {
        throw writeFailureAsGraphQLError(result.error.message, result.error.code);
      }
      return {
        mediaItemId: result.value.mediaItemId,
        status: result.value.status.value,
        mimeType: result.value.mimeType,
        size: result.value.size,
        kind: result.value.kind.value,
      };
    }),
  },
};

export default mediaUploadResolvers;
