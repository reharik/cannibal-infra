import type { EntityId } from '../../types/types';
import type { MediaProcessingJobStatusValue } from './mediaProcessingJobStatus';

export type MediaProcessingJobRow = {
  id: EntityId;
  mediaItemId: EntityId;
  status: MediaProcessingJobStatusValue;
  attemptCount: number;
  availableAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: EntityId;
  updatedBy: EntityId;
};

export type MediaProcessingJobRepository = {
  enqueueIfNoneActive: (input: { mediaItemId: EntityId; actorId: EntityId }) => Promise<void>;
  claimNextAvailableJob: () => Promise<MediaProcessingJobRow | undefined>;
  markSucceeded: (jobId: EntityId, actorId: EntityId) => Promise<void>;
  markFailed: (jobId: EntityId, actorId: EntityId, lastError: string) => Promise<void>;
};
