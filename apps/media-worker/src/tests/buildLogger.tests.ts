import { describe, expect, it } from '@jest/globals';

import type { IocGeneratedCradle } from '../di/generated/ioc-registry.types';
import { buildLogger } from '../infrastructure/logger/logger';

describe('buildLogger', () => {
  describe('When built with log level only', () => {
    it('should return a logger with callable levels', () => {
      const logger = buildLogger({
        config: { logLevel: 'error' } as IocGeneratedCradle['config'],
      } as IocGeneratedCradle);

      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });
  });
});
