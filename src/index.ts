import cors from 'cors';
import express from 'express';
import { OpenAPIBackend } from 'openapi-backend/backend';

import { loggerServiceFactory, LoggerService } from './services/logger/logger';
import { spawnAPIBackend } from './services/openapi-backend/openapi-backend';
import { StateService, stateServiceFactory } from './services/state/state';
import { SpawnWebServer, spawnWebServer } from './services/webserver/webserver';

export const main = (deps: {
  backendEngine: typeof OpenAPIBackend;
  cors: typeof cors;
  express: typeof express;
  loggerService: LoggerService;
  spawnAPIBackend: (deps: {
    backendEngine: typeof OpenAPIBackend;
    stateService: StateService;
  }) => Promise<OpenAPIBackend>;
  spawnWebServer: SpawnWebServer;
  stateService: StateService;
}) => {
  return deps
    .spawnAPIBackend({
      backendEngine: OpenAPIBackend,
      stateService: deps.stateService,
    })
    .then((api: OpenAPIBackend) => deps.spawnWebServer({ cors, express })(api));
};

// istanbul ignore if
if (process.env.NODE_ENV === 'production') {
  main({
    backendEngine: OpenAPIBackend,
    cors,
    express,
    loggerService: loggerServiceFactory()({} as any),
    spawnAPIBackend,
    spawnWebServer,
    stateService: stateServiceFactory(),
  });
}
