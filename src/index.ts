import fs from 'fs';

import cors from 'cors';
import express from 'express';
import { OpenAPIBackend } from 'openapi-backend/backend';

import { EMPTY_UNIVERSE, Universe } from './assets/universe';

import { configServiceFactory } from './services/config/service';
import { Config } from './services/config/types';
import { loggerServiceFactory } from './services/logger/service';
import { spawnAPIBackend } from './services/openapi-backend/service';
import { stateServiceFactory } from './services/state/service';
import { State } from './services/state/types';
import { timeServiceFactory } from './services/time/service';
import { spawnWebServer } from './services/webserver/service';

export const main = (deps: {
  spawnAPIBackend: typeof spawnAPIBackend;
  spawnWebServer: typeof spawnWebServer;
  initialState?: State;
}) => (config: Config) => (universe: Universe = EMPTY_UNIVERSE) => {
  const configService = configServiceFactory(config);
  const loggerService = loggerServiceFactory(configService.get('logger'));
  const stateService = stateServiceFactory(
    deps.initialState || { playerList: [], universe },
  );
  const timeService = timeServiceFactory({
    configService,
    loggerService,
    stateService,
  });
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
