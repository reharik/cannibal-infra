import type { EntityId } from '../../types/types';
import type { Comment } from './Comment';

export type CommentRepository = {
  getById: (id: EntityId) => Promise<Comment | undefined>;
  save: (comment: Comment, resourceId: EntityId) => Promise<void>;
};
