/* AUTO-GENERATED. DO NOT EDIT.
Re-run `npm run gen:manifest` after changing factories or IoC config.
*/
import type { Logger } from '@packages/infrastructure';
import type {
  AddAlbumItem,
  AlbumReadRepository,
  AlbumRepository,
  CommentRepository,
  CreateAlbum,
  CreateMediaUpload,
  DeleteAlbum,
  DeleteAlbumItem,
  DeleteMediaItem,
  FinalizeMediaItemUpload,
  MediaAssetReadRepository,
  MediaItemReadRepository,
  MediaItemRepository,
  MediaStorage,
  NotificationRepository,
  SetCoverMedia,
  ShareLinkRepository,
  UnsetCoverMedia,
  UserRepository,
  ViewerAlbumReadServiceFactory,
  ViewerMediaItemReadServiceFactory,
} from '@packages/media-core';
import type { Knex } from 'knex';
import type { ProcessNextMediaImageJob } from '../../application/processNextMediaImageJob.js';
import type { Config } from '../../config.js';
import type { KnexConfig } from '../../knexfile.js';
import type { MediaProcessingJobRepository } from '../../repositories/domainRepositories/mediaProcessingJobRepository.js';
import type { RunMediaWorkerLoop } from '../../runMediaWorkerLoop.js';

export interface IocGeneratedTypes {
  addAlbumItem: AddAlbumItem;
  albumReadRepository: AlbumReadRepository;
  albumRepository: AlbumRepository;
  commentRepository: CommentRepository;
  config: Config;
  createAlbum: CreateAlbum;
  createMediaUpload: CreateMediaUpload;
  deleteAlbum: DeleteAlbum;
  deleteAlbumItem: DeleteAlbumItem;
  deleteMediaItem: DeleteMediaItem;
  finalizeMediaItemUpload: FinalizeMediaItemUpload;
  database: Knex;
  knexConfig: KnexConfig;
  logger: Logger;
  mediaAssetReadRepository: MediaAssetReadRepository;
  mediaItemReadRepository: MediaItemReadRepository;
  mediaItemRepository: MediaItemRepository;
  mediaProcessingJobRepository: MediaProcessingJobRepository;
  mediaStorage: MediaStorage;
  notificationRepository: NotificationRepository;
  processNextMediaImageJob: ProcessNextMediaImageJob;
  runMediaWorkerLoop: RunMediaWorkerLoop;
  setCoverMedia: SetCoverMedia;
  shareLinkRepository: ShareLinkRepository;
  unsetCoverMedia: UnsetCoverMedia;
  userRepository: UserRepository;
  viewerAlbumReadServiceFactory: ViewerAlbumReadServiceFactory;
  viewerMediaItemReadServiceFactory: ViewerMediaItemReadServiceFactory;
  readServiceFactories: {
    viewerAlbumReadServiceFactory: ViewerAlbumReadServiceFactory;
    viewerMediaItemReadServiceFactory: ViewerMediaItemReadServiceFactory;
  };
  writeServices: {
    addAlbumItem: AddAlbumItem;
    createAlbum: CreateAlbum;
    createMediaUpload: CreateMediaUpload;
    deleteAlbum: DeleteAlbum;
    deleteAlbumItem: DeleteAlbumItem;
    deleteMediaItem: DeleteMediaItem;
    finalizeMediaItemUpload: FinalizeMediaItemUpload;
    setCoverMedia: SetCoverMedia;
    unsetCoverMedia: UnsetCoverMedia;
  };
}

export type IocGeneratedCradle = IocGeneratedTypes;
