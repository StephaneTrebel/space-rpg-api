import get from 'lodash/fp/get';

import { DEFAULT_LOGGER_CONFIG } from '../logger/service';
import { LogLevel } from '../logger/types';

import { Config, ConfigService } from './types';

export const getURL = (config: Config) => (endpoint: string) =>
  `${config.server.baseURL}${endpoint}`;

type ConfigServiceFactory = (config: Config) => ConfigService;
export const configServiceFactory: ConfigServiceFactory = (
  config,
) => ({
  get: (path: string) => get(path, config as any),
  getURL: (endpoint: string) => getURL(config)(endpoint),
});

export const DEFAULT_CONFIG: Config = {
  logger: { ...DEFAULT_LOGGER_CONFIG, disabled: true },
  server: {
    baseURL: 'http://127.0.0.1:9000',
    port: 9000,
  },
  time: {
    period: 0,
    startDelay: 0,
  },
};

export const DEFAULT_DEBUG_CONFIG: Config = {
  ...DEFAULT_CONFIG,
  logger: {
    ...DEFAULT_LOGGER_CONFIG,
    console: true,
    disabled: false,
    level: LogLevel.DEBUG,
  },
};
