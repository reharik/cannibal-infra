// import { MediaItemKindEnum, MediaItemStatusEnum } from "@packages/contracts";
// import { EntityId } from "../../../types/types";
// import { MediaItem } from "../../../domain/MediaItem/MediaItem";
// import { IocGeneratedCradle } from "../../../di/generated/ioc-registry.types";

// type CreateMediaUploadInput = {
//   viewerId: string;
//   kind: MediaItemKindEnum;
//   mimeType: string;
// };

// type CreateMediaUploadResult = {
//   mediaItemId: EntityId;
//   status: MediaItemStatusEnum;
//   uploadTarget: UploadTarget;
// };

// export const buildMediaItemUpload = ({mediaItemRepository,mediaStorage}: IocGeneratedCradle) => {
//     return async (input: CreateMediaUploadInput): Promise<CreateMediaUploadResult> => {
//         const { viewerId, kind, mimeType } = input;
//         const mediaItem = MediaItem.create({
//             ownerId: viewerId,
//             kind,
//             mimeType,
//         },viewerId);

//         await mediaItemRepository.save(mediaItem);
//         const uploadTarget = await mediaStorage.getUploadTarget({
//             storageKey: mediaItem.storageKey,
//             mimeType,
//         });
//         return { mediaItemId, status: mediaItem.status, uploadTarget };
// }

// const mediaItemId = entityIdFactory.create();
// const storageKey = mediaItemId; // or `media/${mediaItemId}`

// const mediaItem = MediaItem.create({
//   id: mediaItemId,
//   ownerId: viewerId,
//   kind,
//   mimeType,
//   storageKey,
// });

// await mediaItemRepository.save(mediaItem);

// const uploadTarget = await mediaStorage.getUploadTarget({
//   storageKey,
//   mimeType,
// });

// return {
//   mediaItemId,
//   status: mediaItem.status,
//   uploadTarget,
// };
