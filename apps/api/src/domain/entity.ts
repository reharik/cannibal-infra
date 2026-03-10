/**
 * Base metadata shared by all domain entities.
 * Id and audit fields are assigned by the system at persistence.
 */

import type { User } from "./user";

export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: User;
  updatedBy: User;
}
