import {
  AlbumMemberRoleEnum,
  AppErrorCollection,
  MediaItemStatus,
  MediaKind,
} from '@packages/contracts';
import { Album } from '../domain/Album/Album';
import { MediaItem } from '../domain/MediaItem/MediaItem';
import { TEST_OWNER_1_ID, TEST_USER_A_ID, TEST_VIEWER_ONLY_ID } from './testViewerIds';

describe('MediaItem (domain)', () => {
  describe('When created', () => {
    it('should start in pending status', () => {
      const ownerId = TEST_USER_A_ID;
      const item = MediaItem.create({ kind: MediaKind.photo, mimeType: 'image/jpeg' }, ownerId);
      expect(item.status()).toBe(MediaItemStatus.pending);
    });
  });

  describe('When completeUploadedWithMetadata is called from pending', () => {
    it('should transition to uploaded without dimensions', () => {
      const ownerId = TEST_USER_A_ID;
      const item = MediaItem.create({ kind: MediaKind.photo, mimeType: 'image/jpeg' }, ownerId);
      const result = item.completeUploadedWithMetadata({ sizeBytes: 100, mimeType: 'image/png' }, ownerId);
      expect(result.success).toBe(true);
      expect(item.status()).toBe(MediaItemStatus.uploaded);
      expect(item.sizeBytes()).toBe(100);
      expect(item.mimeType()).toBe('image/png');
      expect(item.width()).toBeUndefined();
      expect(item.height()).toBeUndefined();
    });
  });

  describe('When completeReadyWithMetadata is called from pending with dimensions', () => {
    it('should transition to ready', () => {
      const ownerId = TEST_USER_A_ID;
      const item = MediaItem.create({ kind: MediaKind.photo, mimeType: 'image/jpeg' }, ownerId);
      const result = item.completeReadyWithMetadata(
        { sizeBytes: 100, width: 800, height: 600 },
        ownerId,
      );
      expect(result.success).toBe(true);
      expect(item.status()).toBe(MediaItemStatus.ready);
      expect(item.width()).toBe(800);
      expect(item.height()).toBe(600);
    });
  });

  describe('When completeReadyWithMetadata is called but the item is already ready', () => {
    it('should fail with status not pending', () => {
      const ownerId = TEST_USER_A_ID;
      const item = MediaItem.create({ kind: MediaKind.photo, mimeType: 'image/jpeg' }, ownerId);
      item.completeReadyWithMetadata({ sizeBytes: 1, width: 1, height: 1 }, ownerId);
      const result = item.completeReadyWithMetadata({ sizeBytes: 1, width: 2, height: 2 }, ownerId);
      expect(result.success).toBe(false);
      let code = '';
      if (!result.success) {
        code = result.error.code;
      }
      expect(code).toBe(AppErrorCollection.mediaItem.StatusNotPending.code);
    });
  });
});

describe('Album (domain)', () => {
  const ownerId = TEST_OWNER_1_ID;

  describe('When addItem is called with duplicate media', () => {
    it('should reject the second add with media already in album', () => {
      const album = Album.create({ title: 'Trip' }, ownerId);
      const mediaId = 'media-1';
      const first = album.addItem(mediaId, ownerId);
      expect(first.success).toBe(true);
      const second = album.addItem(mediaId, ownerId);
      expect(second.success).toBe(false);
      let code = '';
      if (!second.success) {
        code = second.error.code;
      }
      expect(code).toBe(AppErrorCollection.album.MediaAlreadyInAlbum.code);
    });
  });

  describe('When setCoverMedia targets media that is not an album item', () => {
    it('should fail without an independent readiness check in the aggregate API', () => {
      const album = Album.create({ title: 'Trip' }, ownerId);
      const r = album.setCoverMedia('not-in-album', ownerId);
      expect(r.success).toBe(false);
      let code = '';
      if (!r.success) {
        code = r.error.code;
      }
      expect(code).toBe(AppErrorCollection.album.CoverMediaNotPartOfAlbum.code);
    });
  });

  describe('When setCoverMedia targets media that is already represented as an album item', () => {
    it('should succeed based on membership only', () => {
      const album = Album.create({ title: 'Trip' }, ownerId);
      const mediaId = 'media-cover';
      const add = album.addItem(mediaId, ownerId);
      expect(add.success).toBe(true);
      const r = album.setCoverMedia(mediaId, ownerId);
      expect(r.success).toBe(true);
    });
  });

  describe('When a viewer member without add privileges tries to add an item', () => {
    it('should fail with member not allowed to add item', () => {
      const album = Album.create({ title: 'Trip' }, ownerId);
      const viewerId = TEST_VIEWER_ONLY_ID;
      const addMember = album.addMember(viewerId, AlbumMemberRoleEnum.viewer, ownerId);
      expect(addMember.success).toBe(true);
      const r = album.addItem('media-x', viewerId);
      expect(r.success).toBe(false);
      let code = '';
      if (!r.success) {
        code = r.error.code;
      }
      expect(code).toBe(AppErrorCollection.album.MemberNotAllowedToAddItem.code);
    });
  });
});
