// istanbul ignore file
import { createLogger, format, transports } from 'winston';
import { Format } from 'logform';

interface LoggerConfig {
  combinedFile?: boolean;
  console?: boolean;
  errorFile?: boolean;
  format?: boolean;
}

type CreateTransportList = (
  config: LoggerConfig,
) => Array<
  transports.FileTransportInstance | transports.ConsoleTransportInstance
>;
const createTransportList: CreateTransportList = config => {
  const transportList = [];
  if (config.errorFile) {
    transportList.push(
      new transports.File({
        filename: 'error.log',
        level: 'error',
      }),
    );
  }
  if (config.combinedFile) {
    transportList.push(new transports.File({ filename: 'combined.log' }));
  }
  if (config.console) {
    transportList.push(
      new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
      }),
    );
  }
  return transportList;
};

type FormatFactory = (config: LoggerConfig) => Format | undefined;
const createFormat: FormatFactory = config =>
  config.format
    ? format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
      )
    : undefined;

type Logger = (x: any) => void;

export interface LoggerService {
  debug: Logger;
  error: Logger;
  log: Logger;
  warn: Logger;
}

type LoggerServiceFactory = (
  transportListFactory?: CreateTransportList,
  formatFactory?: FormatFactory,
) => (config: LoggerConfig) => LoggerService;

export const loggerServiceFactory: LoggerServiceFactory = (
  transportListFactory = createTransportList,
  formatFactory = createFormat,
) => (config: LoggerConfig) =>
  createLogger({
    defaultMeta: { service: 'space-rpg-api' },
    format: formatFactory(config),
    level: 'info',
    transports: transportListFactory(config),
  });
