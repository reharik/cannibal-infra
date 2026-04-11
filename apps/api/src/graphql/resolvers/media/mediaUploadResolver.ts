import { MediaKind } from '@packages/contracts';
import { authenticatedResolver } from '../../context/authenticatedContext';
import type { Resolvers } from '../../generated/types.generated';
import { toContractErrorPayload } from '../../mappers/contractErrorMapper';

const mediaUploadResolvers: Pick<Resolvers, 'Mutation'> = {
  Mutation: {
    createMediaUpload: authenticatedResolver(async (_parent, args, ctx) => {
      const result = await ctx.writeServices.createMediaUpload({
        viewerId: ctx.viewer.id,
        kind: MediaKind.fromValue(args.input.kind),
        mimeType: args.input.mimeType,
        originalFileName: args.input.originalFileName ?? undefined,
      });

      return {
        data: result.success
          ? {
              mediaItemId: result.value.mediaItemId,
              status: result.value.status.value,
              uploadInstructions: {
                method: result.value.uploadTarget.method,
                url: result.value.uploadTarget.url,
                headers: (result.value.uploadTarget.headers ?? []).map((h) => ({
                  key: h.name,
                  value: h.value,
                })),
              },
            }
          : undefined,
        errors: result.success ? [] : [toContractErrorPayload(result.error)],
      };
    }),
    finalizeMediaUpload: authenticatedResolver(async (_parent, args, ctx) => {
      const result = await ctx.writeServices.finalizeMediaItemUpload({
        viewerId: ctx.viewer.id,
        mediaItemId: args.input.mediaItemId,
      });

      return {
        data: result.success
          ? {
              mediaItemId: result.value.mediaItemId,
              status: result.value.status.value,
              mimeType: result.value.mimeType,
              size: result.value.size,
              kind: result.value.kind.value,
            }
          : undefined,
        errors: result.success ? [] : [toContractErrorPayload(result.error)],
      };
    }),
  },
};

export default mediaUploadResolvers;
