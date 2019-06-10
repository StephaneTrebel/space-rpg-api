// istanbul ignore file
import fs from 'fs';

import { Format } from 'logform';
import { config, createLogger, format, transports } from 'winston';

import { LogLevel, LoggerConfig, LoggerService } from './types';

type CreateTransportList = (
  config: LoggerConfig,
) => Array<
  | transports.FileTransportInstance
  | transports.ConsoleTransportInstance
  | transports.StreamTransportInstance
>;

const createTransportList: CreateTransportList = loggerConfig => {
  const transportList = [];
  if (loggerConfig.nolog) {
    transportList.push(
      new transports.Stream({
        stream: fs.createWriteStream('/dev/null'),
      }),
    );
    return transportList;
  }
  if (loggerConfig.errorFile) {
    transportList.push(
      new transports.File({
        filename: 'error.log',
        level: 'error',
      }),
    );
  }
  if (loggerConfig.combinedFile) {
    transportList.push(new transports.File({ filename: 'combined.log' }));
  }
  if (loggerConfig.console) {
    transportList.push(
      new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
      }),
    );
  }
  return transportList;
};

type FormatFactory = (config: LoggerConfig) => Format | undefined;
const createFormat: FormatFactory = loggerConfig =>
  loggerConfig.format
    ? format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
      )
    : undefined;

export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  combinedFile: false,
  console: false,
  errorFile: false,
  format: false,
  level: LogLevel.INFO,
  nolog: true,
};

type LoggerServiceFactory = (config?: LoggerConfig) => LoggerService;
export const loggerServiceFactory: LoggerServiceFactory = (
  loggerConfig: LoggerConfig = DEFAULT_LOGGER_CONFIG,
) =>
  createLogger({
    format: createFormat(loggerConfig),
    level: loggerConfig.level,
    levels: config.syslog.levels,
    transports: createTransportList(loggerConfig),
  });
