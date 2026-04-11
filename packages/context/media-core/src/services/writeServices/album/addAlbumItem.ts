import { AppErrorCollection, ContractError, MediaItemStatus } from '@packages/contracts';
import { Album } from '../../../domain/Album/Album';
import { fail, ok } from '../../../domain/utilities/writeResponse';
import { AlbumRepository } from '../../../repositories/domainRepositories/albumRepository';
import { MediaItemReadRepository } from '../../../repositories/readRepositories/mediaItemReadRepository';
import { EntityId, WriteResult } from '../../../types/types';
import { MediaItemRow } from '../../readServices/viewerReadServices/viewerMediaItemReadService.types';
import { WriteServiceBase } from '../writeServiceBaseType';
import { AddAlbumItemCommand, AddAlbumItemResult } from './writeAlbum.types';

export interface AddAlbumItem extends WriteServiceBase {
  (input: AddAlbumItemCommand): Promise<WriteResult<AddAlbumItemResult>>;
}

type AddAlbumItemDeps = {
  albumRepository: AlbumRepository;
  mediaItemReadRepository: MediaItemReadRepository;
};

export const buildAddAlbumItem = ({
  albumRepository,
  mediaItemReadRepository,
}: AddAlbumItemDeps): AddAlbumItem => {
  return async (input: AddAlbumItemCommand): Promise<WriteResult<AddAlbumItemResult>> => {
    const { viewerId, albumId, mediaItemId } = input;
    const r1 = await getAlbumOrFailure(albumId, albumRepository);
    if (!r1.success) {
      return r1;
    }
    const r2 = await getMediaItemOrFailure(mediaItemId, viewerId, mediaItemReadRepository);
    if (!r2.success) {
      return r2;
    }
    const album = r1.value;
    const mediaItem = r2.value;

    const r3 = ensureMediaItemOwnedByViewer(mediaItem, viewerId);
    if (!r3.success) {
      return r3;
    }
    const r4 = ensureMediaItemInReadyState(mediaItem);
    if (!r4.success) {
      return r4;
    }

    const r5 = album.addItem(mediaItemId, viewerId);
    if (!r5.success) {
      return r5;
    }
    const albumItem = r5.value;
    await albumRepository.save(album);

    return ok({
      albumId: album.id(),
      albumItemId: albumItem.id(),
    });
  };
};

const getAlbumOrFailure = async (
  albumId: EntityId,
  albumRepository: AlbumRepository,
): Promise<WriteResult<Album, ContractError>> => {
  const album = await albumRepository.getById(albumId);
  return album ? ok(album) : fail(AppErrorCollection.album.AlbumNotFound);
};

const getMediaItemOrFailure = async (
  mediaItemId: EntityId,
  viewerId: EntityId,
  mediaItemReadRepository: MediaItemReadRepository,
): Promise<WriteResult<MediaItemRow, ContractError>> => {
  const mediaItem = await mediaItemReadRepository.getForViewer({ mediaItemId, viewerId });
  return mediaItem ? ok(mediaItem) : fail(AppErrorCollection.mediaItem.MediaItemNotFound);
};

const ensureMediaItemOwnedByViewer = (item: MediaItemRow, viewerId: EntityId) =>
  item?.ownerId === viewerId
    ? ok(undefined)
    : fail(AppErrorCollection.mediaItem.MediaItemNotOwnedByViewer);

const ensureMediaItemInReadyState = (mediaItem: MediaItemRow) =>
  mediaItem.status === MediaItemStatus.ready.value ||
  mediaItem.status === MediaItemStatus.uploaded.value
    ? ok(undefined)
    : fail(AppErrorCollection.mediaItem.MediaItemNotReady);
