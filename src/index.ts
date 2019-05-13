import fs from 'fs';

import cors from 'cors';
import express from 'express';
import { OpenAPIBackend } from 'openapi-backend/backend';

import { EMPTY_UNIVERSE, Universe } from './assets/universe';

import { Config, configServiceFactory } from './services/config/config';
import { loggerServiceFactory } from './services/logger/logger';
import { spawnAPIBackend } from './services/openapi-backend/openapi-backend';
import { stateServiceFactory } from './services/state/state';
import { timeServiceFactory } from './services/time/time';
import { spawnWebServer } from './services/webserver/webserver';

export const main = (deps: {
  spawnAPIBackend: typeof spawnAPIBackend;
  spawnWebServer: typeof spawnWebServer;
}) => (config: Config) => (universe: Universe = EMPTY_UNIVERSE) => {
  const configService = configServiceFactory(config);
  const loggerService = loggerServiceFactory(configService.get('logger'));
  const stateService = stateServiceFactory({ playerList: [], universe });
  const timeService = timeServiceFactory();
  return deps
    .spawnAPIBackend({
      backendEngine: OpenAPIBackend,
      loggerService,
      stateService,
      timeService,
    })
    .then((api: OpenAPIBackend) => deps.spawnWebServer({ cors, express })(api));
};

// istanbul ignore if
if (process.env.NODE_ENV === 'production') {
  main({
    spawnAPIBackend,
    spawnWebServer,
  })({
    logger: {
      combinedFile: true,
      console: true,
      errorFile: true,
      format: true,
    },
  })(JSON.parse(fs.readFileSync('src/assets/universe.json', 'utf-8')));
}
