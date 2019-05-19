// istanbul ignore file
import fs from 'fs';

import { Format } from 'logform';
import { createLogger, format, transports } from 'winston';

import { LoggerConfig, LoggerService } from './types';

type CreateTransportList = (
  config: LoggerConfig,
) => Array<
  | transports.FileTransportInstance
  | transports.ConsoleTransportInstance
  | transports.StreamTransportInstance
>;
const createTransportList: CreateTransportList = config => {
  const transportList = [];
  if (config.nolog) {
    transportList.push(
      new transports.Stream({
        stream: fs.createWriteStream('/dev/null'),
      }),
    );
    return transportList;
  }
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

type LoggerServiceFactory = (config?: LoggerConfig) => LoggerService;

export const loggerServiceFactory: LoggerServiceFactory = (
  config: LoggerConfig = { nolog: true },
) =>
  createLogger({
    defaultMeta: { service: 'space-rpg-api' },
    format: createFormat(config),
    level: 'info',
    transports: createTransportList(config),
  });
