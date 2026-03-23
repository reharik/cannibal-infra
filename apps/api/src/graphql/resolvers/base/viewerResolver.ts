import type { Resolvers } from "../../generated/types.generated";
import { AlbumParent, ViewerParent } from "../parentModels";

const viewerResolvers: Pick<Resolvers, "Query" | "Viewer" | "Album"> = {
  Query: {
    viewer: (_p, _a, ctx): ViewerParent | undefined => {
      return ctx.viewer;
    },
  },

  Viewer: {
    albums: async (parent, _a, ctx): Promise<AlbumParent[]> => {
      return ctx.readServices?.listAlbums() || [];
    },
  },
};

export default viewerResolvers;
