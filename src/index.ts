import cors from 'cors';
import express from 'express';

import { spawnAPIBackend } from './services/openapi-backend/openapi-backend';
import { SpawnWebServer, spawnWebServer } from './services/webserver/webserver';
import { OpenAPIBackend } from 'openapi-backend/backend';
import { StateService, stateServiceFactory } from './services/state/state';

export const main = (deps: {
  backendEngine: typeof OpenAPIBackend;
  cors: typeof cors;
  express: typeof express;
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
    spawnAPIBackend,
    spawnWebServer,
    stateService: stateServiceFactory(),
  });
}
