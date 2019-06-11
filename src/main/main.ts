import http from 'http';

import cors from 'cors';
import express from 'express';
import OpenAPIBackend from 'openapi-backend';

import { configServiceFactory } from '../services/config/service';
import { ConfigService } from '../services/config/types';
import { loggerServiceFactory } from '../services/logger/service';
import { LoggerService } from '../services/logger/types';
import { SpawnAPIBackend } from '../services/openapi-backend/service';
import { stateServiceFactory } from '../services/state/service';
import { StateService } from '../services/state/types';
import { timeServiceFactory } from '../services/time/service';
import { TimeService } from '../services/time/types';
import { SpawnWebServer } from '../services/webserver/service';

import { Universe } from '../assets/universe';

import { MainDeps, MainParams, MainAssets } from './types';

interface InstanciateApplicationParams {
  configService: ConfigService;
  loggerService: LoggerService;
  spawnAPIBackend: SpawnAPIBackend;
  spawnWebServer: SpawnWebServer;
  stateService: StateService;
  timeService: TimeService;
}

export const instanciateApplication = ({
  loggerService,
  spawnAPIBackend,
  spawnWebServer,
  stateService,
  timeService,
}: InstanciateApplicationParams) =>
  spawnAPIBackend({
    backendEngine: OpenAPIBackend,
    loggerService,
    stateService,
    timeService,
  })
    .then((api: OpenAPIBackend) => spawnWebServer({ cors, express })(api))
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
    })
    .catch(error => {
      loggerService.error(
        `Error while instanciating the application logic: ${error.message}`,
      );
      return Promise.reject(error);
    });

export type Main = (
  deps: MainDeps,
) => (params: MainParams) => (universe: Universe) => Promise<MainAssets>;
export const main: Main = deps => params => universe =>
  // Since we're returning a promise, we might as well start as soon as
  // possible to factor out error handling in the `catch`
  new Promise<InstanciateApplicationParams>((resolve, reject) => {
    try {
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
      return resolve({
        configService,
        loggerService,
        spawnAPIBackend: deps.spawnAPIBackend,
        spawnWebServer: deps.spawnWebServer,
        stateService,
        timeService,
      });
    } catch (error) {
      return reject(error);
    }
  })
    .then(instanciateApplication)
    .catch(error => {
      console.log(`FATAL error while starting the service: ${error.message}`);
      return Promise.reject(error);
    });
