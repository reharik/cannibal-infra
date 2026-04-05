import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { Knex } from 'knex';

/**
 * Writes bytes to the local media root at the path implied by `mediaItem.storageKey`,
 * matching what `localMediaStorage.getObjectMetadata` expects for finalize integration tests.
 */
export const writeLocalMediaObjectBytesForIntegrationTest = async (
  database: Knex,
  mediaStorageRoot: string,
  mediaItemId: string,
  bytes: Buffer,
): Promise<void> => {
  const row = await database('mediaItem')
    .where({ id: mediaItemId })
    .first<{ storageKey: string }>();

  if (!row?.storageKey) {
    throw new Error(`media item not found or missing storageKey: ${mediaItemId}`);
  }

  const segments = row.storageKey.split('/').filter(Boolean);
  const filePath = path.join(path.resolve(mediaStorageRoot), ...segments);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, bytes);
};
