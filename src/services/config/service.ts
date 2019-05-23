import get from 'lodash/fp/get';

import { Config, ConfigService } from './types';

type ConfigServiceFactory = (config?: Config) => ConfigService;
export const configServiceFactory: ConfigServiceFactory = (config = {}) => ({
  get: (path: string) => get(path, config as any),
});

export const DEFAULT_CONFIG: Config = {
  logger: { nolog: true },
};
