import { MediaItemStatus } from '@packages/contracts';
import type { Context } from 'koa';

import type { IocGeneratedCradle } from '../di/generated/ioc-registry.types';

export interface MediaController {
  upload: (ctx: Context) => Promise<Context>;
}

interface UploadedFileLike {
  filepath: string;
  mimetype?: string;
  size: number;
  originalFilename?: string | null;
}

const isUploadedFileLike = (value: unknown): value is UploadedFileLike => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.filepath === 'string' &&
    typeof candidate.size === 'number' &&
    (typeof candidate.mimetype === 'string' || typeof candidate.mimetype === 'undefined')
  );
};

const resolveUploadedFile = (files: unknown): UploadedFileLike | null => {
  if (typeof files !== 'object' || files === null) {
    return null;
  }

  const values = Object.values(files as Record<string, unknown>);

  for (const value of values) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (isUploadedFileLike(item)) {
          return item;
        }
      }
      continue;
    }

    if (isUploadedFileLike(value)) {
      return value;
    }
  }

  return null;
};

export const buildMediaController = ({
  mediaItemRepository,
  mediaStorage,
}: IocGeneratedCradle): MediaController => ({
  upload: async (ctx: Context): Promise<Context> => {
    const viewer = ctx.user;
    if (!viewer) {
      ctx.status = 401;
      ctx.body = { error: 'Authentication required' };
      return ctx;
    }

    const { mediaItemId } = ctx.params as { mediaItemId?: string };
    if (!mediaItemId) {
      ctx.status = 400;
      ctx.body = { error: 'Missing route param mediaItemId.' };
      return ctx;
    }

    const mediaItem = await mediaItemRepository.getById(mediaItemId);
    if (!mediaItem) {
      ctx.status = 404;
      ctx.body = { error: 'Media item not found.' };
      return ctx;
    }

    if (mediaItem.ownerId() !== viewer.id) {
      ctx.status = 403;
      ctx.body = { error: 'Forbidden' };
      return ctx;
    }

    if (mediaItem.status() !== MediaItemStatus.pending) {
      ctx.status = 409;
      ctx.body = { error: 'Media item is not awaiting upload.' };
      return ctx;
    }

    const uploadedFile = resolveUploadedFile(ctx.request.files);
    if (!uploadedFile) {
      ctx.status = 400;
      ctx.body = { error: 'No file uploaded.' };
      return ctx;
    }

    await mediaStorage.writeUploadedFile({
      storageKey: mediaItem.storageKey(),
      sourceFilePath: uploadedFile.filepath,
      mimeType: uploadedFile.mimetype,
    });

    ctx.status = 201;
    ctx.body = {
      mediaItemId: mediaItem.id(),
      size: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
    };

    return ctx;
  },
});
