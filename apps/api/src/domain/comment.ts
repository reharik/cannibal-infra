/**
 * Comment: user comment attached to an Album or MediaItem.
 */

import type { ResourceTypeEnum } from "@photo-app/contracts";
import type { Entity } from "./entity";
import type { User } from "./user";

export interface Comment extends Entity {
  resourceType: ResourceTypeEnum;
  author: User;
  content: string;
}

/**
 * Data required to create a comment. Id and timestamps are assigned by the system.
 */
export type CommentCreate = Pick<
  Comment,
  "resourceType" | "author" | "content"
>;
