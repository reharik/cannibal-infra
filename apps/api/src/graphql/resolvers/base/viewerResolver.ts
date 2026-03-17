import type { Resolvers } from "../../generated/types.generated";

const viewerResolvers: Pick<Resolvers, "Query"> = {
  Query: {
    viewer: (_p, _a, ctx) => {
      return ctx.viewer;
    },
  },
};

export default viewerResolvers;
