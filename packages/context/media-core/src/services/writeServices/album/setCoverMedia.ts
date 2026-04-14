import { ensureMemberCanEditAlbum } from '../../../application/support/albumguard';
import {
  ensureMediaItemInReadyState,
  ensureMediaItemOwnedByViewer,
} from '../../../application/support/mediaItemGuard';
import {
  loadRequiredAlbum,
  loadRequiredReadOnlyMediaItem,
} from '../../../application/support/resourceLoaders';
import { ok } from '../../../domain/utilities/writeResponse';
import { AlbumRepository } from '../../../repositories/domainRepositories/albumRepository';
import { MediaItemReadRepository } from '../../../repositories/readRepositories/mediaItemReadRepository';
import { WriteResult } from '../../../types/types';
import { WriteServiceBase } from '../writeServiceBaseType';
import { SetCoverMediaCommand, SetCoverMediaResult } from './writeAlbum.types';

export interface SetCoverMedia extends WriteServiceBase {
  (input: SetCoverMediaCommand): Promise<WriteResult<SetCoverMediaResult>>;
}

type SetCoverMediaDeps = {
  albumRepository: AlbumRepository;
  mediaItemReadRepository: MediaItemReadRepository;
};

export const buildSetCoverMedia = ({
  albumRepository,
  mediaItemReadRepository,
}: SetCoverMediaDeps): SetCoverMedia => {
  return async (input: SetCoverMediaCommand): Promise<WriteResult<SetCoverMediaResult>> => {
    const { viewerId, albumId, mediaItemId } = input;
    const r1 = await loadRequiredAlbum(albumId, albumRepository);
    if (!r1.success) {
      return r1;
    }
    const r2 = await loadRequiredReadOnlyMediaItem(mediaItemId, viewerId, mediaItemReadRepository);
    if (!r2.success) {
      return r2;
    }
    const album = r1.value;
    const mediaItem = r2.value;

    const r3 = ensureMediaItemOwnedByViewer(mediaItem.ownerId, viewerId);
    if (!r3.success) {
      return r3;
    }
    const r4 = ensureMemberCanEditAlbum(album, viewerId);
    if (!r4.success) {
      return r4;
    }
    const r5 = ensureMediaItemInReadyState(mediaItem);
    if (!r5.success) {
      return r5;
    }

    const r6 = album.setCoverMedia(mediaItemId, viewerId);
    if (!r6.success) {
      return r6;
    }
    await albumRepository.save(album);

    return ok({
      albumId: album.id(),
      mediaCoverId: mediaItemId,
    });
  };
};
