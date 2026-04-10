export const MediaProcessingJobStatus = {
  pending: 'pending',
  processing: 'processing',
  succeeded: 'succeeded',
  failed: 'failed',
} as const;

export type MediaProcessingJobStatusValue =
  (typeof MediaProcessingJobStatus)[keyof typeof MediaProcessingJobStatus];
