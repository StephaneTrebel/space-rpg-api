export enum LogLevel {
  EMERG = 'emerg',
  ALERT = 'alert',
  CRIT = 'crit',
  ERROR = 'error',
  WARNING = 'warning',
  NOTICE = 'notice',
  INFO = 'info',
  DEBUG = 'debug',
}
export interface LoggerConfig {
  combinedFile: boolean;
  console: boolean;
  disabled: boolean;
  errorFile: boolean;
  format: boolean;
  level: LogLevel;
}

type Logger = (x: any) => void;

export interface LoggerService {
  debug: Logger;
  error: Logger;
  info: Logger;
  log: Logger;
  warn: Logger;
}
