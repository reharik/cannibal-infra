import type { ApolloClient } from '@apollo/client';

import {
  CreateMediaUploadDocument,
  FinalizeMediaUploadDocument,
  type CreateMediaUploadMutationVariables,
} from '../../graphql/generated/types';
import { fail, ok, type AppResult } from '../errors/types';
import { executeMutation } from '../graphql/executeMutation';

const resolveMediaKind = (
  file: File,
): CreateMediaUploadMutationVariables['input']['kind'] | undefined => {
  if (file.type.startsWith('image/')) return 'PHOTO';
  if (file.type.startsWith('video/')) return 'VIDEO';
  return undefined;
};

const buildUploadBody = (file: File, method: string): BodyInit => {
  if (method.toUpperCase() === 'PUT') return file;

  const formData = new FormData();
  formData.append('file', file);
  return formData;
};

const createMediaUpload = async (
  client: ApolloClient,
  file: File,
): Promise<
  AppResult<{
    mediaItemId: string;
    uploadInstructions: {
      url: string;
      method: string;
      headers: Array<{ key: string; value: string }>;
    };
  }>
> => {
  const kind = resolveMediaKind(file);
  if (!kind) {
    // TODO: add these to FrontendErrorEnum
    return fail([
      {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Only image and video uploads are supported.',
        category: 'VALIDATION',
        retryable: false,
        source: 'frontend',
      },
    ]);
  }

  const mimeType = file.type || 'application/octet-stream';

  const result = await executeMutation(
    client,
    {
      mutation: CreateMediaUploadDocument,
      variables: { input: { kind, mimeType } },
    },
    (data) => data.createMediaUpload,
  );

  if (!result.success) {
    return result;
  }

  const payload = result.data;
  if (!payload?.mediaItemId || !payload.uploadInstructions?.url) {
    return fail([
      {
        code: 'INVALID_RESPONSE',
        message: 'Create media upload returned an invalid payload.',
        category: 'VALIDATION',
        retryable: false,
        source: 'frontend',
      },
    ]);
  }

  return ok({
    mediaItemId: payload.mediaItemId,
    uploadInstructions: payload.uploadInstructions,
  });
};

const uploadBinary = async (
  file: File,
  uploadInstructions: {
    url: string;
    method: string;
    headers: Array<{ key: string; value: string }>;
  },
): Promise<AppResult<void>> => {
  const token = localStorage.getItem('authToken');

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  for (const h of uploadInstructions.headers) {
    headers[h.key] = h.value;
  }

  const response = await fetch(uploadInstructions.url, {
    method: uploadInstructions.method,
    headers,
    body: buildUploadBody(file, uploadInstructions.method),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    return fail([
      {
        code: 'UPLOAD_FAILED',
        message: text || `Upload failed with status ${response.status}.`,
        category: 'VALIDATION',
        retryable: false,
        source: 'frontend',
      },
    ]);
  }

  return ok(undefined);
};

const finalizeMediaUpload = async (
  client: ApolloClient,
  mediaItemId: string,
): Promise<AppResult<{ mediaItemId: string }>> => {
  const result = await executeMutation(
    client,
    {
      mutation: FinalizeMediaUploadDocument,
      variables: { input: { mediaItemId } },
    },
    (data) => data.finalizeMediaUpload,
  );

  if (!result.success) {
    return result;
  }

  const payload = result.data;
  if (!payload?.mediaItemId) {
    return fail([
      {
        code: 'FINALIZE_FAILED',
        message: 'Finalize media upload returned an invalid payload.',
        category: 'VALIDATION',
        retryable: false,
        source: 'frontend',
      },
    ]);
  }

  return ok({ mediaItemId: payload.mediaItemId });
};

export const mediaUploadWorkflow = async (
  client: ApolloClient,
  file: File,
): Promise<AppResult<{ mediaItemId: string }>> => {
  try {
    const created = await createMediaUpload(client, file);
    if (!created.success) return created;
    const uploaded = await uploadBinary(file, created.data.uploadInstructions);
    if (!uploaded.success) return uploaded;

    return await finalizeMediaUpload(client, created.data.mediaItemId);
  } catch (error) {
    return fail([
      {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unexpected error',
        category: 'SYSTEM',
        retryable: false,
        source: 'frontend',
      },
    ]);
  }
};
