import { MediaAssetKind } from '@packages/contracts';
import type { MediaStorage } from './MediaStorage';
import { buildMediaAssetStorageKey } from './MediaStorage';

type AssetStatusSource = {
  kind: string;
  status: string;
};

const normalizeKind = (kind: string): string => kind.trim().toLowerCase();
const normalizeStatus = (status: string): string => status.trim().toLowerCase();

const isAssetReady = (asset: AssetStatusSource): boolean => normalizeStatus(asset.status) === 'ready';

const hasReadyAssetKind = (assets: AssetStatusSource[], requestedKind: MediaAssetKind): boolean => {
  const requestedKindValue = normalizeKind(requestedKind.value);
  return assets.some((asset) => normalizeKind(asset.kind) === requestedKindValue && isAssetReady(asset));
};

export const resolvePreferredAssetKind = (
  assets: AssetStatusSource[],
  requestedKind: MediaAssetKind,
): MediaAssetKind => {
  if (requestedKind === MediaAssetKind.original) {
    return MediaAssetKind.original;
  }
  return hasReadyAssetKind(assets, requestedKind) ? requestedKind : MediaAssetKind.original;
};

export const resolveMediaAssetUrl = (input: {
  mediaStorage: MediaStorage;
  baseStorageKey: string;
  requestedKind: MediaAssetKind;
  assets: AssetStatusSource[];
}): { url: string; storageKey: string; resolvedKind: MediaAssetKind; fallbackToOriginal: boolean } => {
  const resolvedKind = resolvePreferredAssetKind(input.assets, input.requestedKind);
  const storageKey = buildMediaAssetStorageKey(input.baseStorageKey, resolvedKind);
  return {
    url: input.mediaStorage.getObjectUrl(storageKey),
    storageKey,
    resolvedKind,
    fallbackToOriginal: resolvedKind !== input.requestedKind,
  };
};
