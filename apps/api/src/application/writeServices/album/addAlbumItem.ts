import {
  AlbumErrorEnum,
  AppErrorCollection,
  MediaItemErrorEnum,
  MediaItemStatus,
} from '@packages/contracts';
import { IocGeneratedCradle } from 'apps/api/src/di/generated/ioc-registry.types';
import { Album, AlbumRepository } from 'apps/api/src/domain';
import { fail, ok } from 'apps/api/src/domain/utilities/writeResponse';
import { MediaItemReadRepository } from 'apps/api/src/repositories/readRepositories/mediaItemReadRepository';
import { EntityId, WriteResult } from 'apps/api/src/types/types';
import { WriteServiceBase } from '../writeServiceBaseType';
import { MediaItemRow } from '../../readServices/viewerReadServices/viewerMediaItemReadService.types';
import { AddAlbumItemCommand, AddAlbumItemResult } from './writeAlbum.types';

export interface AddAlbumItem extends WriteServiceBase {
  (input: AddAlbumItemCommand): Promise<WriteResult<AddAlbumItemResult>>;
}

export const buildAddAlbumItem = ({
  albumRepository,
  mediaItemReadRepository,
}: IocGeneratedCradle): AddAlbumItem => {
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
): Promise<WriteResult<Album, AlbumErrorEnum>> => {
  const album = await albumRepository.getById(albumId);
  return album ? ok(album) : fail(AppErrorCollection.album.AlbumNotFound);
};

const getMediaItemOrFailure = async (
  mediaItemId: EntityId,
  viewerId: EntityId,
  mediaItemReadRepository: MediaItemReadRepository,
): Promise<WriteResult<MediaItemRow, MediaItemErrorEnum>> => {
  const mediaItem = await mediaItemReadRepository.getForViewer({ mediaItemId, viewerId });
  return mediaItem ? ok(mediaItem) : fail(AppErrorCollection.mediaItem.MediaItemNotFound);
};

const ensureMediaItemOwnedByViewer = (item: MediaItemRow, viewerId: EntityId) =>
  item?.ownerId === viewerId
    ? ok(undefined)
    : fail(AppErrorCollection.mediaItem.MediaItemNotOwnedByViewer);

const ensureMediaItemInReadyState = (mediaItem: MediaItemRow) =>
  mediaItem.status === MediaItemStatus.ready.value
    ? ok(undefined)
    : fail(AppErrorCollection.mediaItem.MediaItemNotReady);
