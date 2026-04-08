import { SortDir } from '@packages/contracts';
import { reviveEnumField, type AnyEnumLike, type StandardEnumItem } from '@reharik/smart-enum';
import type { CollectionInfo } from '../../types/types';
import type { PageInfoInput } from '../generated/types.generated';

type GraphQlCollectionInfoInput = {
  pageInfo: PageInfoInput;
  sortBy: string;
  sortDir: string;
};

export const standardizeCollectionInput = <
  TSortByItem extends StandardEnumItem & { column: string },
>(
  input: GraphQlCollectionInfoInput,
  sortByEnum: AnyEnumLike<TSortByItem>,
): CollectionInfo<TSortByItem> => {
  const limit = Math.min(input.pageInfo.limit ?? 10, 100);
  const offset = input.pageInfo.offset ?? 0;

  const sortBy = reviveEnumField(input.sortBy, sortByEnum, true);
  const sortDir = SortDir.fromValue(input.sortDir);

  if (sortBy === undefined || sortDir === undefined) {
    throw new Error('Invalid collection input: enum revival failed');
  }

  return {
    pageInfo: {
      limit,
      offset,
    },
    sortBy,
    sortDir,
  };
};
