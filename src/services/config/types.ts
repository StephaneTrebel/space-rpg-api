import { LoggerConfig } from '../logger/types';
import { TimeConfig } from '../time/types';
import { ServerConfig } from '../webserver/types';

export interface Config {
  logger: LoggerConfig;
  server: ServerConfig;
  time: TimeConfig;
}

export interface ConfigService {
  get: (path: string) => any;
  getURL: (endpoint: string) => string;
}
