import get from 'lodash/fp/get';

import { LoggerConfig } from '../logger/logger';
import { TimeConfig } from '../time/time';

export interface Config {
  logger?: LoggerConfig;
  time?: TimeConfig;
}

export interface ConfigService {
  get: (path: string) => any;
}

type ConfigServiceFactory = (config: Config) => ConfigService;

export const configServiceFactory: ConfigServiceFactory = config => ({
  get: (path: string) => get(path, config as any),
});
