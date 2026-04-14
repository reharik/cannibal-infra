import { describe, expect, it } from '@jest/globals';

import iocConfig from '../ioc.config';

describe('ioc.config', () => {
  describe('When the default export is loaded', () => {
    it('should define discovery and registrations for the worker', () => {
      expect(iocConfig).toEqual(
        expect.objectContaining({
          discovery: expect.objectContaining({
            scanDirs: expect.any(Array),
            generatedDir: expect.any(String),
          }),
          registrations: expect.any(Object),
        }),
      );
    });
  });
});
