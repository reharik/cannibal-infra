import { MediaItemStatus } from '@packages/contracts';
import type { Context } from 'koa';

import type { IocGeneratedCradle } from '../di/generated/ioc-registry.types';

export interface MediaController {
  upload: (ctx: Context) => Promise<Context>;
}

export const buildMediaController = ({
  mediaItemRepository,
  mediaStorage,
}: IocGeneratedCradle): MediaController => ({
  upload: async (ctx: Context): Promise<Context> => {
    const viewer = ctx.state.user;
    if (!viewer) {
      ctx.status = 401;
      ctx.body = { error: 'Authentication required' };
      return ctx;
    }

    const { mediaItemId } = ctx.params as { mediaItemId?: string };
    if (!mediaItemId) {
      ctx.status = 400;
      ctx.body = { error: 'Missing route param mediaItemId.' };
      return ctx;
    }

    const mediaItem = await mediaItemRepository.getById(mediaItemId);
    if (!mediaItem) {
      ctx.status = 404;
      ctx.body = { error: 'Media item not found.' };
      return ctx;
    }

    if (mediaItem.ownerId() !== viewer.id) {
      ctx.status = 403;
      ctx.body = { error: 'Forbidden' };
      return ctx;
    }

    if (mediaItem.status() !== MediaItemStatus.pending) {
      ctx.status = 409;
      ctx.body = { error: 'Media item is not awaiting upload.' };
      return ctx;
    }

    await mediaStorage.writeObject({
      storageKey: mediaItem.storageKey(),
      body: ctx.req,
      mimeType: mediaItem.mimeType(),
    });

    ctx.status = 201;
    ctx.body = {
      mediaItemId: mediaItem.id(),
      mimeType: mediaItem.mimeType(),
    };

    return ctx;
  },
});
