import type { EntityId } from "../../types/types";
import type { Notification } from "./Notification";

export type NotificationRepository = {
  getById: (id: EntityId) => Promise<Notification | null>;
  save: (notification: Notification) => Promise<void>;
};
