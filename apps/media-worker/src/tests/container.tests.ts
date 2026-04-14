import { describe, expect, it, jest } from '@jest/globals';

describe('Worker container', () => {
  describe('When getWorkerContainer is imported before initializeWorkerContainer', () => {
    it('should throw a clear error', async () => {
      jest.resetModules();
      const { getWorkerContainer } = await import('../container');
      expect(() => getWorkerContainer()).toThrow(/container has not been initialized/);
    });
  });
});
