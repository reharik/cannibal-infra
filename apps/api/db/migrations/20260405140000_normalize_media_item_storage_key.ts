import type { Knex } from 'knex';

/**
 * Keys were `media/{userId}/{kind}/{id}` while MEDIA_STORAGE_ROOT is already the media directory,
 * producing `…/media/media/…` on disk. Normalize to `{userId}/{kind}/{id}` relative to that root.
 */
export const up = async (knex: Knex): Promise<void> => {
  await knex.raw(
    `UPDATE media_item SET storage_key = substr(storage_key, 7) WHERE storage_key LIKE 'media/%'`,
  );
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.raw(
    `UPDATE media_item SET storage_key = 'media/' || storage_key WHERE storage_key NOT LIKE 'media/%'`,
  );
};
