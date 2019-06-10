export enum LogLevel {
  EMERG = 'EMERG',
  ALERT = 'ALERT',
  CRIT = 'CRIT',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  NOTICE = 'NOTICE',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}
export interface LoggerConfig {
  combinedFile?: boolean;
  console?: boolean;
  errorFile?: boolean;
  format?: boolean;
  level: LogLevel;
  nolog?: boolean;
}

type Logger = (x: any) => void;

export interface LoggerService {
  debug: Logger;
  error: Logger;
  info: Logger;
  log: Logger;
  warn: Logger;
}
