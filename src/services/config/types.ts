import { LoggerConfig } from '../logger/types';
import { TimeConfig } from '../time/types';

export interface Config {
  logger?: LoggerConfig;
  time?: TimeConfig;
}

export interface ConfigService {
  get: (path: string) => any;
}
