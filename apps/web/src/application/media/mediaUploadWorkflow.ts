import type { ApolloClient } from '@apollo/client';

import {
  CreateMediaUploadDocument,
  FinalizeMediaUploadDocument,
  type CreateMediaUploadMutation,
  type CreateMediaUploadMutationVariables,
  type FinalizeMediaUploadMutation,
  type FinalizeMediaUploadMutationVariables,
} from '../../graphql/generated/types';

type MediaUploadErrorCode =
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'CREATE_FAILED'
  | 'UPLOAD_FAILED'
  | 'FINALIZE_FAILED'
  | 'NETWORK_ERROR'
  | 'INVALID_RESPONSE';

export type MediaUploadResult =
  | { success: true; mediaItemId: string }
  | { success: false; code: MediaUploadErrorCode; message: string };

const resolveMediaKind = (
  file: File,
): CreateMediaUploadMutationVariables['input']['kind'] | undefined => {
  if (file.type.startsWith('image/')) return 'PHOTO';
  if (file.type.startsWith('video/')) return 'VIDEO';
  return undefined;
};

const buildUploadBody = (file: File, method: string): BodyInit => {
  if (method.toUpperCase() === 'PUT') {
    return file;
  }

  const formData = new FormData();
  formData.append('file', file);
  return formData;
};

export const mediaUploadWorkflow = async (
  client: ApolloClient,
  file: File,
): Promise<MediaUploadResult> => {
  try {
    const kind = resolveMediaKind(file);
    if (!kind) {
      return {
        success: false,
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Only image and video uploads are supported.',
      };
    }

    const mimeType = file.type || 'application/octet-stream';

    const created = await client.mutate<
      CreateMediaUploadMutation,
      CreateMediaUploadMutationVariables
    >({
      mutation: CreateMediaUploadDocument,
      variables: { input: { kind, mimeType } },
    });

    if (created.error) {
      return {
        success: false,
        code: 'CREATE_FAILED',
        message: created.error.message,
      };
    }

    const payload = created.data?.createMediaUpload;
    if (!payload?.mediaItemId || !payload.uploadInstructions?.url) {
      return {
        success: false,
        code: 'INVALID_RESPONSE',
        message: 'Create media upload returned an invalid payload.',
      };
    }

    const headers: Record<string, string> = {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };

    for (const h of payload.uploadInstructions.headers) {
      headers[h.key] = h.value;
    }

    const uploadRes = await fetch(payload.uploadInstructions.url, {
      method: payload.uploadInstructions.method,
      headers,
      body: buildUploadBody(file, payload.uploadInstructions.method),
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => '');
      return {
        success: false,
        code: 'UPLOAD_FAILED',
        message: text || `Upload failed with status ${uploadRes.status}.`,
      };
    }

    const finalized = await client.mutate<
      FinalizeMediaUploadMutation,
      FinalizeMediaUploadMutationVariables
    >({
      mutation: FinalizeMediaUploadDocument,
      variables: { input: { mediaItemId: payload.mediaItemId } },
    });

    if (finalized.error) {
      return {
        success: false,
        code: 'FINALIZE_FAILED',
        message: finalized.error.message,
      };
    }

    const mediaItemId = finalized.data?.finalizeMediaUpload?.mediaItemId;
    if (!mediaItemId) {
      return {
        success: false,
        code: 'INVALID_RESPONSE',
        message: 'Finalize media upload returned no media item id.',
      };
    }

    return { success: true, mediaItemId };
  } catch (error) {
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Unexpected error',
    };
  }
};
