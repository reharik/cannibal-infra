import fs from 'node:fs';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { MediaStorage, UploadTarget } from '../../application/media/MediaStorage';
import { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';

const assertSafeStorageKeySegments = (storageKey: string): string[] => {
  const segments = storageKey.split('/').filter(Boolean);

  if (segments.length === 0) {
    throw new Error('Invalid storage key: empty path');
  }

  for (const segment of segments) {
    if (segment === '.' || segment === '..') {
      throw new Error('Invalid storage key: path traversal');
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(segment)) {
      throw new Error(`Invalid storage key segment: ${segment}`);
    }
  }

  return segments;
};

const getObjectFilePathForStorageKey = (storageRoot: string, storageKey: string): string => {
  const segments = assertSafeStorageKeySegments(storageKey);
  return path.join(storageRoot, ...segments);
};

const readOptionalMimeSidecar = async (objectPath: string): Promise<string | undefined> => {
  try {
    const mimeType = (await fs.promises.readFile(`${objectPath}.mime`, 'utf8')).trim();
    return mimeType.length > 0 ? mimeType : undefined;
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? (err as NodeJS.ErrnoException).code
        : undefined;

    if (code === 'ENOENT') {
      return undefined;
    }

    throw err;
  }
};

export const buildLocalMediaStorage = ({ config }: IocGeneratedCradle): MediaStorage => {
  const storageRoot = path.resolve(config.mediaStorageRoot);

  return {
    // eslint-disable-next-line @typescript-eslint/require-await
    getUploadTarget: async (input: {
      mediaItemId: string;
      storageKey: string;
      mimeType: string;
    }): Promise<UploadTarget> => {
      return {
        url: `${config.serverUrl}/api/media/uploads/${input.mediaItemId}`,
        method: 'PUT',
        headers: {},
      };
    },

    writeObject: async (input: {
      storageKey: string;
      body: Readable;
      mimeType?: string;
    }): Promise<void> => {
      const destinationPath = getObjectFilePathForStorageKey(storageRoot, input.storageKey);

      await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });

      const writeStream = fs.createWriteStream(destinationPath);
      await pipeline(input.body, writeStream);
    },

    getObjectMetadata: async (
      storageKey: string,
    ): Promise<{ size: number; mimeType?: string } | null> => {
      const objectPath = getObjectFilePathForStorageKey(storageRoot, storageKey);
      try {
        const stat = await fs.promises.stat(objectPath);
        if (!stat.isFile()) {
          return null;
        }

        const mimeType = await readOptionalMimeSidecar(objectPath);

        return {
          size: stat.size,
          mimeType,
        };
      } catch (err: unknown) {
        const code =
          err && typeof err === 'object' && 'code' in err
            ? (err as NodeJS.ErrnoException).code
            : undefined;

        if (code === 'ENOENT') {
          return null;
        }

        throw err;
      }
    },

    verifyExistence: async (storageKey: string): Promise<boolean> => {
      const objectPath = getObjectFilePathForStorageKey(storageRoot, storageKey);

      try {
        const stat = await fs.promises.stat(objectPath);
        return stat.isFile();
      } catch (err: unknown) {
        const code =
          err && typeof err === 'object' && 'code' in err
            ? (err as NodeJS.ErrnoException).code
            : undefined;

        if (code === 'ENOENT') {
          return false;
        }

        throw err;
      }
    },

    getObjectUrl: (storageKey: string): string => {
      const encodedStorageKey = encodeURIComponent(storageKey);
      return `${config.serverUrl}/api/media/objects/${encodedStorageKey}`;
    },

    getObjectStream: async (
      storageKey: string,
    ): Promise<{ body: Readable; mimeType?: string } | null> => {
      const objectPath = getObjectFilePathForStorageKey(storageRoot, storageKey);
      try {
        const stat = await fs.promises.stat(objectPath);
        if (!stat.isFile()) {
          return null;
        }
        const mimeType = await readOptionalMimeSidecar(objectPath);
        return {
          body: fs.createReadStream(objectPath),
          mimeType,
        };
      } catch (err: unknown) {
        const code =
          err && typeof err === 'object' && 'code' in err
            ? (err as NodeJS.ErrnoException).code
            : undefined;
        if (code === 'ENOENT') {
          return null;
        }
        throw err;
      }
    },
  };
};
