// import { Readable } from 'node:stream';

// import { MediaAssetKind, MediaItemStatus, MediaKind } from '@packages/contracts';

// import { buildMediaAssetStorageKey } from '../media/MediaStorage';
// import { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
// import { MediaAsset } from '../../../../../packages/context/media-core/src/domain/MediaAsset/MediaAsset';
// import { generateImageDerivatives } from './imageDerivativeGenerator';
// import { readStreamToBuffer } from './readStreamToBuffer';

// export type ProcessNextMediaImageJobResult = 'processed' | 'idle';

// export type ProcessNextMediaImageJob = () => Promise<ProcessNextMediaImageJobResult>;

// const loadOrCreateDerivativeAsset = (input: {
//   existing: MediaAsset | undefined;
//   mediaItemId: string;
//   kind: MediaAssetKind;
//   mimeType: string;
//   ownerId: string;
// }): MediaAsset => {
//   if (input.existing) {
//     return input.existing;
//   }
//   return MediaAsset.create(
//     {
//       mediaItemId: input.mediaItemId,
//       kind: input.kind,
//       mimeType: input.mimeType,
//     },
//     input.ownerId,
//   );
// };

// const serializeError = (e: unknown): string => {
//   if (e instanceof Error) {
//     return `${e.name}: ${e.message}`;
//   }
//   return String(e);
// };

// export const buildProcessNextMediaImageJob = ({
//   mediaProcessingJobRepository,
//   mediaItemRepository,
//   mediaAssetRepository,
//   mediaStorage,
//   logger,
// }: IocGeneratedCradle): ProcessNextMediaImageJob => {
//   return async (): Promise<ProcessNextMediaImageJobResult> => {
//     const job = await mediaProcessingJobRepository.claimNextAvailableJob();
//     if (!job) {
//       return 'idle';
//     }

//     const actorId = job.createdBy;

//     const finishSucceeded = async (): Promise<void> => {
//       await mediaProcessingJobRepository.markSucceeded(job.id, actorId);
//     };

//     const finishFailed = async (message: string): Promise<void> => {
//       await mediaProcessingJobRepository.markFailed(job.id, actorId, message);
//     };

//     try {
//       const mediaItem = await mediaItemRepository.getById(job.mediaItemId);
//       if (!mediaItem) {
//         await finishFailed('Media item not found');
//         return 'processed';
//       }

//       if (mediaItem.status() === MediaItemStatus.ready) {
//         await finishSucceeded();
//         return 'processed';
//       }

//       if (mediaItem.kind() !== MediaKind.photo) {
//         await finishFailed('Only photo media is supported for image processing');
//         return 'processed';
//       }

//       if (mediaItem.status() !== MediaItemStatus.uploaded) {
//         await finishFailed(`Media item not processable (status: ${mediaItem.status().value})`);
//         return 'processed';
//       }

//       const ownerId = mediaItem.ownerId();
//       const originalKey = buildMediaAssetStorageKey(mediaItem.storageKey(), MediaAssetKind.original);
//       const streamResult = await mediaStorage.getObjectStream(originalKey);
//       if (!streamResult) {
//         await finishFailed('Original object not found in storage');
//         return 'processed';
//       }

//       const originalBuffer = await readStreamToBuffer(streamResult.body);
//       const derivatives = await generateImageDerivatives(originalBuffer);

//       const displayKey = buildMediaAssetStorageKey(mediaItem.storageKey(), MediaAssetKind.display);
//       const thumbnailKey = buildMediaAssetStorageKey(
//         mediaItem.storageKey(),
//         MediaAssetKind.thumbnail,
//       );

//       await mediaStorage.writeObject({
//         storageKey: displayKey,
//         body: Readable.from(derivatives.display.buffer),
//         mimeType: derivatives.display.mimeType,
//       });
//       await mediaStorage.writeObject({
//         storageKey: thumbnailKey,
//         body: Readable.from(derivatives.thumbnail.buffer),
//         mimeType: derivatives.thumbnail.mimeType,
//       });

//       const displayAsset = loadOrCreateDerivativeAsset({
//         existing: await mediaAssetRepository.getByMediaItemIdAndKind(
//           job.mediaItemId,
//           MediaAssetKind.display,
//         ),
//         mediaItemId: job.mediaItemId,
//         kind: MediaAssetKind.display,
//         mimeType: derivatives.display.mimeType,
//         ownerId,
//       });
//       displayAsset.applyUploadedObjectMetadata(
//         {
//           sizeBytes: derivatives.display.fileSizeBytes,
//           mimeType: derivatives.display.mimeType,
//           width: derivatives.display.width,
//           height: derivatives.display.height,
//         },
//         ownerId,
//       );

//       const thumbnailAsset = loadOrCreateDerivativeAsset({
//         existing: await mediaAssetRepository.getByMediaItemIdAndKind(
//           job.mediaItemId,
//           MediaAssetKind.thumbnail,
//         ),
//         mediaItemId: job.mediaItemId,
//         kind: MediaAssetKind.thumbnail,
//         mimeType: derivatives.thumbnail.mimeType,
//         ownerId,
//       });
//       thumbnailAsset.applyUploadedObjectMetadata(
//         {
//           sizeBytes: derivatives.thumbnail.fileSizeBytes,
//           mimeType: derivatives.thumbnail.mimeType,
//           width: derivatives.thumbnail.width,
//           height: derivatives.thumbnail.height,
//         },
//         ownerId,
//       );

//       const readyResult = mediaItem.markReadyAfterDerivatives(
//         {
//           displayWidth: derivatives.display.width,
//           displayHeight: derivatives.display.height,
//         },
//         ownerId,
//       );
//       if (!readyResult.success) {
//         await finishFailed(`${readyResult.error.code}: ${readyResult.error.display}`);
//         return 'processed';
//       }

//       await mediaAssetRepository.save(displayAsset);
//       await mediaAssetRepository.save(thumbnailAsset);
//       await mediaItemRepository.save(mediaItem);
//       await finishSucceeded();
//       return 'processed';
//     } catch (e) {
//       const message = serializeError(e);
//       if (e instanceof Error) {
//         logger.error('Media image processing failed', e);
//       } else {
//         logger.error('Media image processing failed', { err: String(e) });
//       }
//       await finishFailed(message);
//       return 'processed';
//     }
//   };
// };
