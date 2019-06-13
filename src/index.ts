// istanbul ignore file

import * as fs from 'fs';
import * as process from 'process';

import { LogLevel } from './services/logger/types';
import { spawnAPIBackend } from './services/openapi-backend/service';
import { spawnWebServer } from './services/webserver/service';

import { main } from './main/main';

if (process.env.NODE_ENV === 'production') {
  main({
    spawnAPIBackend,
    spawnWebServer,
  })({
    config: {
      logger: {
        combinedFile: true,
        console: true,
        disabled: false,
        errorFile: true,
        format: true,
        level: LogLevel.DEBUG,
      },
      server: {
        baseURL: process.env.BASE_URL || 'http://127.0.0.1:9000',
        port: process.env.PORT ? parseInt(process.env.PORT, 10) : 9000,
      },
      time: {
        period: 66,
        startDelay: 1000,
      },
    },
    startTime: true,
  })(JSON.parse(fs.readFileSync('src/assets/universe.json', 'utf-8')));
}
