// istanbul ignore file

import * as fs from 'fs';

import { LogLevel } from './services/logger/types';
import { spawnAPIBackend } from './services/openapi-backend/service';
import { spawnWebServer } from './services/webserver/service';
import { Protocol } from './services/webserver/types';

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
        level: LogLevel.INFO,
      },
      server: {
        host: '127.0.0.1',
        port: 9000,
        protocol: Protocol.HTTP,
      },
      time: {
        period: 66,
        startDelay: 1000,
      },
    },
    startTime: true,
  })(JSON.parse(fs.readFileSync('src/assets/universe.json', 'utf-8')));
}
