/**
 * Maps a DB row to a domain record by copying all properties except those in excludeKeys.
 * Used to strip FK columns (e.g. albumId) from child rows before rehydration.
 */
export const rowToRecord = <T extends Record<string, unknown>>(
  row: Record<string, unknown>,
  excludeKeys: string[] = [],
): T => {
  return Object.fromEntries(
    Object.entries(row).filter(([k]) => !excludeKeys.includes(k)),
  ) as T;
};
