import get from 'lodash/fp/get';

import { Config, ConfigService } from './types';
import { Protocol } from '../webserver/types';

type ConfigServiceFactory = (config?: Config) => ConfigService;
export const configServiceFactory: ConfigServiceFactory = config => ({
  get: (path: string) => get(path, config as any),
});

export const DEFAULT_CONFIG: Config = {
  logger: { nolog: true },
  server: {
    host: '127.0.0.1',
    port: 9000,
    protocol: Protocol.HTTP,
  },
  time: {
    period: 0,
    startDelay: 0,
  },
};

export const getURL = (config: Config) => (endpoint: string) =>
  `${config.server.protocol}://${config.server.host}:${
    config.server.port
  }${endpoint}`;
