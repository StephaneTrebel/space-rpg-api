import fs from 'fs';
import http from 'http';

import cors from 'cors';
import express from 'express';
import { OpenAPIBackend } from 'openapi-backend/backend';

import { EMPTY_UNIVERSE, Universe } from './assets/universe';

import { configServiceFactory } from './services/config/service';
import { Config } from './services/config/types';
import { loggerServiceFactory } from './services/logger/service';
import { LoggerService } from './services/logger/types';
import { spawnAPIBackend } from './services/openapi-backend/service';
import { stateServiceFactory } from './services/state/service';
import { State } from './services/state/types';
import { timeServiceFactory } from './services/time/service';
import { ActionList } from './services/time/types';
import { spawnWebServer, SpawnWebServer } from './services/webserver/service';

export interface MainDeps {
  initialActionQueue?: ActionList;
  initialState?: State;
  spawnAPIBackend: typeof spawnAPIBackend;
  spawnWebServer: SpawnWebServer;
}

export interface MainParams {
  config: Config;
  startTime?: boolean;
}

export interface MainAssets {
  loggerService: LoggerService;
  server: http.Server;
  teardown: () => void;
}

export type Main = (
  deps: MainDeps,
) => (params: MainParams) => (universe?: Universe) => Promise<MainAssets>;
export const main: Main = deps => params => (universe = EMPTY_UNIVERSE) => {
  const configService = configServiceFactory(params.config);
  const loggerService = loggerServiceFactory(configService.get('logger'));
  const stateService = stateServiceFactory(
    deps.initialState || { playerList: [], universe },
  );
  const timeService = timeServiceFactory({
    configService,
    loggerService,
    stateService,
  })(deps.initialActionQueue || []);
  if (params.startTime) {
    timeService.start();
  }
  return deps
    .spawnAPIBackend({
      backendEngine: OpenAPIBackend,
      loggerService,
      stateService,
      timeService,
    })
    .then((api: OpenAPIBackend) => ({
      loggerService,
      server: deps.spawnWebServer({ cors, express })(api),
      teardown: () => timeService.stop(),
    }));
};

// istanbul ignore if
if (process.env.NODE_ENV === 'production') {
  main({
    spawnAPIBackend,
    spawnWebServer,
  })({
    config: {
      logger: {
        combinedFile: true,
        console: true,
        errorFile: true,
        format: true,
      },
    },
    startTime: true,
  })(JSON.parse(fs.readFileSync('src/assets/universe.json', 'utf-8')));
}
