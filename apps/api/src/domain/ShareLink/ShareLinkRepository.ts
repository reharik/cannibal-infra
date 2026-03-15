import type { EntityId } from "../../types/types";
import type { ShareLink } from "./ShareLink";

export type ShareLinkRepository = {
  getById: (id: EntityId) => Promise<ShareLink | null>;
  save: (shareLink: ShareLink, albumId: EntityId) => Promise<void>;
};
