import os from 'node:os';
import path from 'node:path';

import { buildLocalMediaStorage } from '../infrastructure/media/localMediaStorage';
import { TEST_VIEWER_1_ID } from './testViewerIds';

describe('LocalMediaStorage (intended contract)', () => {
  const mediaStorageRoot = path.join(os.tmpdir(), 'photoapp-local-media-contract');

  const cradle = {
    config: { serverUrl: 'http://localhost:3001', mediaStorageRoot },
  } as never;

  describe('When getUploadTarget is called', () => {
    it('should return a PUT URL keyed by media item id without embedding the storage key path', async () => {
      const storage = buildLocalMediaStorage(cradle);
      const target = await storage.getUploadTarget({
        mediaItemId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        storageKey: `media/${TEST_VIEWER_1_ID}/f47ac10b-58cc-4372-a567-0e02b2c3d479/original`,
        mimeType: 'image/jpeg',
      });
      expect(target.method).toBe('PUT');
      expect(target.url).toBe(
        'http://localhost:3001/api/media/uploads/f47ac10b-58cc-4372-a567-0e02b2c3d479',
      );
    });
  });

  describe('When getObjectMetadata is called for a key with no stored object', () => {
    it('should resolve to a falsy value so finalize can return a domain failure instead of throwing', async () => {
      const storage = buildLocalMediaStorage(cradle);
      await expect(storage.getObjectMetadata('any-key')).resolves.toBeFalsy();
    });
  });

  describe('When verifyExistence is called', () => {
    it('should resolve to a boolean without throwing', async () => {
      const storage = buildLocalMediaStorage(cradle);
      await expect(storage.verifyExistence('any-key')).resolves.toEqual(expect.any(Boolean));
    });
  });

  describe('When getObjectUrl is called', () => {
    it('should return an API object URL that encodes the storage key', () => {
      const storage = buildLocalMediaStorage(cradle);
      const url = storage.getObjectUrl('media/viewer-1/item-1/original');
      expect(url).toBe('http://localhost:3001/api/media/objects/media%2Fviewer-1%2Fitem-1%2Foriginal');
    });
  });
});
