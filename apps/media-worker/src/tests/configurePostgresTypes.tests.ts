import { describe, expect, it } from '@jest/globals';

import { configurePostgresTypes } from '../infrastructure/database/configurePostgresTypes';

describe('configurePostgresTypes', () => {
  describe('When called multiple times', () => {
    it('should not throw', () => {
      expect(() => {
        configurePostgresTypes();
        configurePostgresTypes();
      }).not.toThrow();
    });
  });
});
