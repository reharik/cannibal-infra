/**
 * -----------------------------------------------------------------------------
 * THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.
 * Any manual changes will be overwritten by GraphQL Code Generator.
 * -----------------------------------------------------------------------------
 */

import { enumeration, type Enumeration } from '@reharik/smart-enum';

const mediaItemStatusInput = ['failed', 'pending', 'ready'] as const;
const mediaKindInput = ['photo', 'video'] as const;
const shareViewerRelationshipInput = ['anonymous', 'authenticated', 'member', 'owner'] as const;
const sortDirInput = ['asc', 'desc'] as const;

export type MediaItemStatus = Enumeration<typeof MediaItemStatus>;
export type MediaKind = Enumeration<typeof MediaKind>;
export type ShareViewerRelationship = Enumeration<typeof ShareViewerRelationship>;
export type SortDir = Enumeration<typeof SortDir>;

export const MediaItemStatus = enumeration<typeof mediaItemStatusInput>('MediaItemStatus', {
  input: mediaItemStatusInput,
});
export const MediaKind = enumeration<typeof mediaKindInput>('MediaKind', {
  input: mediaKindInput,
});
export const ShareViewerRelationship = enumeration<typeof shareViewerRelationshipInput>(
  'ShareViewerRelationship',
  { input: shareViewerRelationshipInput },
);
export const SortDir = enumeration<typeof sortDirInput>('SortDir', {
  input: sortDirInput,
});
