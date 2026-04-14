/**
 * Media item tags: normalized label strings on the aggregate. Persistence maps labels
 * to `user_tag` (canonical per user) and `media_item_tag` join rows.
 */

const MAX_LABEL_LENGTH = 512;
const MAX_TAGS_PER_ITEM = 100;

export type NormalizedMediaItemTagLabels = {
  labels: string[];
};

export const normalizeMediaItemTagLabels = (raw: string[]): NormalizedMediaItemTagLabels | null => {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const s of raw) {
    const trimmed = s.trim();
    if (trimmed.length === 0) {
      continue;
    }
    if (trimmed.length > MAX_LABEL_LENGTH) {
      return null;
    }
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    labels.push(trimmed);
  }
  if (labels.length > MAX_TAGS_PER_ITEM) {
    return null;
  }
  return { labels };
};

export const mediaItemTagLabelKey = (label: string): string => label.toLowerCase();
