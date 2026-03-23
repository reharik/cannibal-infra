import type { Resolvers } from "../../generated/types.generated";
import { MediaItemParent } from "../parentModels";

const albumResolvers: Pick<Resolvers, "Album"> = {
  Album: {
    coverMedia: async (
      parent,
      _a,
      ctx,
    ): Promise<MediaItemParent | undefined> => {
      if (parent.coverMedia !== undefined) {
        return parent.coverMedia;
      }
      return ctx.readServices?.getAlbumCoverMedia({
        albumId: parent.id,
      });
    },
  },
};

export default albumResolvers;
