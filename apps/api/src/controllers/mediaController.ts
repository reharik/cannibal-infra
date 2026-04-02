import type { Context } from 'koa';
import { promises as fs } from 'node:fs';
import path from 'node:path';

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

const sanitizePathSegment = (segment: string): string => {
  return segment.replace(/[^a-zA-Z0-9_-]/g, '_');
};

export const buildMediaController = (): MediaController => ({
  upload: async (ctx: Context): Promise<Context> => {
    const { userId, mediaType, mediaId } = ctx.params as {
      userId?: string;
      mediaType?: string;
      mediaId?: string;
    };

    if (!userId || !mediaType || !mediaId) {
      ctx.status = 400;
      ctx.body = {
        error: 'Missing route params. Expected userId, mediaType, and mediaId.',
      };
      return ctx;
    }

    const uploadedFile = resolveUploadedFile(ctx.request.files);
    if (!uploadedFile) {
      ctx.status = 400;
      ctx.body = { error: 'No file uploaded.' };
      return ctx;
    }

    if (!uploadedFile.mimetype || !uploadedFile.mimetype.startsWith('image/')) {
      ctx.status = 400;
      ctx.body = { error: 'Uploaded file must be an image.' };
      return ctx;
    }

    const uploadsRoot = path.resolve(process.cwd(), 'uploads');
    const targetDirectory = path.join(
      uploadsRoot,
      sanitizePathSegment(userId),
      sanitizePathSegment(mediaType),
    );
    await fs.mkdir(targetDirectory, { recursive: true });

    const extensionFromMimeType = uploadedFile.mimetype.split('/')[1] ?? 'bin';
    const targetFilename = `${sanitizePathSegment(mediaId)}.${sanitizePathSegment(extensionFromMimeType)}`;
    const targetPath = path.join(targetDirectory, targetFilename);

    await fs.copyFile(uploadedFile.filepath, targetPath);

    ctx.status = 201;
    ctx.body = {
      userId,
      mediaType,
      mediaId,
      mimeType: uploadedFile.mimetype,
      size: uploadedFile.size,
    };
    return ctx;
  },
});
