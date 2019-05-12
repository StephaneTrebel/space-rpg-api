import cors from 'cors';
import express from 'express';
import { OpenAPIBackend } from 'openapi-backend/backend';

import { Config, configServiceFactory } from './services/config/config';
import { loggerServiceFactory } from './services/logger/logger';
import { spawnAPIBackend } from './services/openapi-backend/openapi-backend';
import { stateServiceFactory } from './services/state/state';
import { spawnWebServer } from './services/webserver/webserver';

export const main = (deps: {
  spawnAPIBackend: typeof spawnAPIBackend;
  spawnWebServer: typeof spawnWebServer;
}) => (config: Config) => {
  const configService = configServiceFactory(config);
  const loggerService = loggerServiceFactory(configService.get('logger'));
  const stateService = stateServiceFactory();
  return deps
    .spawnAPIBackend({
      backendEngine: OpenAPIBackend,
      loggerService,
      stateService,
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
  });
}
