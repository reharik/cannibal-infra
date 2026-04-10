import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'node:stream';

import type {
  MediaStorage,
  MediaStorageObjectMetadata,
  MediaStorageStreamResult,
  UploadTarget,
  UploadTargetRequest,
} from '../../application/media/MediaStorage';
import { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';

export interface BuildS3MediaStorageInput {
  bucket: string;
  region: string;
  uploadUrlTtlSeconds?: number;
  downloadUrlTtlSeconds?: number;
}

const toReadable = (body: unknown): Readable | null => {
  if (!body) return null;

  if (body instanceof Readable) {
    return body;
  }

  return null;
};

const readableToBuffer = async (body: Readable): Promise<Buffer> => {
  const chunks: Buffer[] = [];

  for await (const chunk of body) {
    if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk);
    } else if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk));
    } else if (chunk instanceof Uint8Array) {
      chunks.push(Buffer.from(chunk));
    } else {
      throw new Error('Unsupported chunk type in stream');
    }
  }

  return Buffer.concat(chunks);
};

const isS3ServiceException = (error: unknown): error is S3ServiceException => {
  return error instanceof S3ServiceException;
};

const isMissingObjectError = (error: unknown): boolean => {
  if (!isS3ServiceException(error)) {
    return false;
  }

  return (
    error.name === 'NoSuchKey' ||
    error.name === 'NotFound' ||
    error.$metadata.httpStatusCode === 404
  );
};

const isMissingOrInvisibleHeadError = (error: unknown): boolean => {
  if (!isS3ServiceException(error)) {
    return false;
  }

  return isMissingObjectError(error) || error.$metadata.httpStatusCode === 403;
};

export const buildS3MediaStorage = ({ config }: IocGeneratedCradle): MediaStorage => {
  const client = new S3Client({ region: config.awsRegion });

  const getUploadTarget = async (input: UploadTargetRequest): Promise<UploadTarget> => {
    const command = new PutObjectCommand({
      Bucket: config.s3Bucket,
      Key: input.storageKey,
      ContentType: input.mimeType,
    });

    const url = await getSignedUrl(client, command, {
      expiresIn: config.s3UploadUrlTtlSeconds,
    });

    return {
      method: 'PUT',
      url,
      headers: input.mimeType ? [{ name: 'Content-Type', value: input.mimeType }] : [],
    };
  };

  const writeObject = async (input: {
    storageKey: string;
    body: Readable;
    mimeType?: string;
  }): Promise<void> => {
    await client.send(
      new PutObjectCommand({
        Bucket: config.s3Bucket,
        Key: input.storageKey,
        Body: input.body,
        ContentType: input.mimeType,
      }),
    );
  };

  const getObjectMetadata = async (
    storageKey: string,
  ): Promise<MediaStorageObjectMetadata | null> => {
    try {
      const result = await client.send(
        new HeadObjectCommand({
          Bucket: config.s3Bucket,
          Key: storageKey,
        }),
      );

      if (result.ContentLength == null) {
        return null;
      }

      return {
        size: result.ContentLength,
        mimeType: result.ContentType,
      };
    } catch (error) {
      if (isMissingOrInvisibleHeadError(error)) {
        return null;
      }

      throw error;
    }
  };

  const verifyExistence = async (storageKey: string): Promise<boolean> => {
    const metadata = await getObjectMetadata(storageKey);
    return metadata != null;
  };

  const getObjectAccessUrl = async (input: {
    storageKey: string;
    expiresInSeconds?: number;
  }): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket: config.s3Bucket,
      Key: input.storageKey,
    });

    return getSignedUrl(client, command, {
      expiresIn: input.expiresInSeconds ?? config.s3DownloadUrlTtlSeconds,
    });
  };

  const getObjectStream = async (storageKey: string): Promise<MediaStorageStreamResult | null> => {
    try {
      const result = await client.send(
        new GetObjectCommand({
          Bucket: config.s3Bucket,
          Key: storageKey,
        }),
      );

      const body = toReadable(result.Body);
      if (!body) {
        return null;
      }

      return {
        body,
        mimeType: result.ContentType,
      };
    } catch (error) {
      if (isMissingObjectError(error)) {
        return null;
      }

      throw error;
    }
  };

  const getObjectBuffer = async (storageKey: string, maxBytes: number): Promise<Buffer | null> => {
    if (maxBytes <= 0) {
      return Buffer.alloc(0);
    }

    try {
      const result = await client.send(
        new GetObjectCommand({
          Bucket: config.s3Bucket,
          Key: storageKey,
          Range: `bytes=0-${maxBytes - 1}`,
        }),
      );

      const body = toReadable(result.Body);
      if (!body) {
        return null;
      }

      return readableToBuffer(body);
    } catch (error) {
      if (isMissingObjectError(error)) {
        return null;
      }

      throw error;
    }
  };

  return {
    getUploadTarget,
    writeObject,
    getObjectMetadata,
    verifyExistence,
    getObjectAccessUrl,
    getObjectStream,
    getObjectBuffer,
  };
};
