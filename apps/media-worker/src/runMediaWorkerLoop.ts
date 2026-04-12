import type { Logger } from '../../../packages/foundation/infrastructure/src/logger/coreLogger.js';
import type { Config } from '../../api/src/config.ts';
import type { ProcessNextMediaImageJob } from './application/processNextMediaImageJob.js';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export type RunMediaWorkerLoop = {
  start: () => Promise<void>;
  stop: () => void;
};

export const buildRunMediaWorkerLoop = ({
  config,
  logger,
  processNextMediaImageJob,
}: {
  config: Config;
  logger: Logger;
  processNextMediaImageJob: ProcessNextMediaImageJob;
}): RunMediaWorkerLoop => {
  let running = false;
  let stopRequested = false;

  const start = async (): Promise<void> => {
    if (running) {
      return;
    }
    running = true;
    stopRequested = false;
    logger.info('Media worker started', {
      pollIntervalMs: config.mediaWorkerPollIntervalMs,
    });

    while (!stopRequested) {
      try {
        const outcome = await processNextMediaImageJob();
        if (outcome === 'idle') {
          await sleep(config.mediaWorkerPollIntervalMs);
        }
      } catch (e) {
        if (e instanceof Error) {
          logger.error('Media worker loop error', e);
        } else {
          logger.error('Media worker loop error', { err: String(e) });
        }
        await sleep(config.mediaWorkerPollIntervalMs);
      }
    }

    running = false;
    logger.info('Media worker stopped');
  };

  const stop = (): void => {
    stopRequested = true;
  };

  return { start, stop };
};
