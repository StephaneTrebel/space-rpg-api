export interface LoggerConfig {
  combinedFile?: boolean;
  console?: boolean;
  errorFile?: boolean;
  format?: boolean;
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
