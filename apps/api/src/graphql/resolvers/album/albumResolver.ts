import type { Resolvers } from '../../generated/types.generated';
import { MediaItemParent } from '../parentModels';

const albumResolvers: Pick<Resolvers, 'Album'> = {
  Album: {
    coverMedia: async (): Promise<MediaItemParent | undefined> => {
      return undefined;
    },
  },
};

export default albumResolvers;
