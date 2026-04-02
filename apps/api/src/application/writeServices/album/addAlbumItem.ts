// import {
//   AppErrorCollection,
//   MediaKind,
//   MediaItemStatus,
// } from "@packages/contracts";
// import { IocGeneratedCradle } from "apps/api/src/di/generated/ioc-registry.types";
// import { fail, ok } from "apps/api/src/domain/utilities/writeResponse";
// import { EntityId, WriteResult } from "apps/api/src/types/types";
// import { WriteServiceBase } from "../writeServiceBaseType";

// export type AddAlbumItemDTO = {
//   viewerId: EntityId;
//   albumId: EntityId;
//   mediaItemId: EntityId;
// };

// export type AddAlbumItemResultDTO = {
//   albumId: EntityId;
//   albumItemId: EntityId;
// };

// export interface AddAlbumItem extends WriteServiceBase {
//   (input: AddAlbumItemDTO): Promise<WriteResult<AddAlbumItemResultDTO>>;
// }

// export const buildAddAlbumItem = ({
//   albumRepository,
//   mediaItemReadRepository,
// }: IocGeneratedCradle): AddAlbumItem => {
//   return async (
//     input: AddAlbumItemDTO,
//   ): Promise<WriteResult<AddAlbumItemResultDTO>> => {
//     const { viewerId, albumId, mediaItemId } = input;
//     const album = await albumRepository.getById(albumId);
//     if (!album) {
//       return fail(AppErrorCollection.album.AlbumNotFound);
//     }
//     if (album.ownerId !== viewerId) {
//       return fail(AppErrorCollection.album.AlbumNotOwnedByViewer);
//     }

//     const mediaItem = await mediaItemReadRepository.getForViewer({
//       mediaItemId,
//       viewerId,
//     });
//     if (!mediaItem) {
//       return fail(AppErrorCollection.mediaItem.MediaItemNotFound);
//     }
//     if (mediaItem.ownerId !== viewerId) {
//       return fail(AppErrorCollection.mediaItem.MediaItemNotOwnedByViewer);
//     }
//     album.addItem(mediaItemId, mediaItem.status, viewerId);
//     await albumRepository.save(album);

//     return ok({
//       mediaItemId: mediaItem.id(),
//       status: mediaItem.status(),
//       mimeType: objectMetadata.mimeType,
//       size: objectMetadata.size,
//       kind: mediaItem.kind(),
//     });
//   };
// };
