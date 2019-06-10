import fs from 'fs';
import http from 'http';

import cors from 'cors';
import express from 'express';
import OpenAPIBackend from 'openapi-backend';

import { EMPTY_UNIVERSE, Universe } from './assets/universe';

import { configServiceFactory } from './services/config/service';
import { Config } from './services/config/types';
import { loggerServiceFactory } from './services/logger/service';
import { LoggerService, LogLevel } from './services/logger/types';
import {
  SpawnAPIBackend,
  spawnAPIBackend,
} from './services/openapi-backend/service';
import { stateServiceFactory } from './services/state/service';
import { State } from './services/state/types';
import { timeServiceFactory } from './services/time/service';
import { ActionList } from './services/time/types';
import { spawnWebServer, SpawnWebServer } from './services/webserver/service';
import { Protocol } from './services/webserver/types';

export interface MainDeps {
  initialActionQueue?: ActionList;
  initialState?: State;
  spawnAPIBackend: SpawnAPIBackend;
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
  const stateService = stateServiceFactory({ loggerService })(
    deps.initialState || { entityList: [], universe },
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
    .then((api: OpenAPIBackend) => deps.spawnWebServer({ cors, express })(api))
    .then((server: http.Server) => {
      loggerService.info('Service started');
      const assets: MainAssets = {
        loggerService,
        server,
        teardown: () => {
          timeService.stop();
          server.close();
        },
      };
      return assets;
    });
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
