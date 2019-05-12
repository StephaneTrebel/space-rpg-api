import get from 'lodash/fp/get';

import { LoggerConfig } from '../logger/logger';

export interface Config {
  logger?: LoggerConfig;
}

export interface ConfigService {
  get: (path: string) => any;
}

type ConfigServiceFactory = (config: Config) => ConfigService;

export const configServiceFactory: ConfigServiceFactory = config => ({
    get: (path: string) => get(path, config as any),
});
