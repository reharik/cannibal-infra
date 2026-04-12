import { coreLogger, Logger } from '@packages/infrastructure';
import { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';

export const buildLogger = ({ config }: IocGeneratedCradle): Logger =>
  coreLogger({
    logJsonFilePath: config.logJsonFilePath,
    logLevel: config.logLevel,
  });
