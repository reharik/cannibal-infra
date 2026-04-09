import { MediaAssetKind } from '@packages/contracts';
import { resolveMediaAssetUrl } from '../application/media/resolveMediaAssetUrl';

describe('resolveMediaAssetUrl', () => {
  const mediaStorage = {
    getObjectUrl: (storageKey: string): string => `https://cdn.test/${storageKey}`,
  } as never;

  describe('When the requested asset kind is ready', () => {
    it('should return the requested asset url', () => {
      const result = resolveMediaAssetUrl({
        mediaStorage,
        baseStorageKey: 'media/viewer-1/item-1',
        requestedKind: MediaAssetKind.thumbnail,
        assets: [
          { kind: 'thumbnail', status: 'ready' },
          { kind: 'original', status: 'ready' },
        ],
      });

      expect(result.url).toBe('https://cdn.test/media/viewer-1/item-1/thumbnail');
      expect(result.resolvedKind).toBe(MediaAssetKind.thumbnail);
      expect(result.fallbackToOriginal).toBe(false);
    });
  });

  describe('When the requested asset kind is not ready', () => {
    it('should fallback to original asset url', () => {
      const result = resolveMediaAssetUrl({
        mediaStorage,
        baseStorageKey: 'media/viewer-1/item-1',
        requestedKind: MediaAssetKind.display,
        assets: [
          { kind: 'display', status: 'pending' },
          { kind: 'original', status: 'ready' },
        ],
      });

      expect(result.url).toBe('https://cdn.test/media/viewer-1/item-1/original');
      expect(result.resolvedKind).toBe(MediaAssetKind.original);
      expect(result.fallbackToOriginal).toBe(true);
    });
  });
});
