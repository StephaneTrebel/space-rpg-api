import cors from 'cors';
import express from 'express';

import { spawnAPIBackend } from './services/openapi-backend/openapi-backend';
import { SpawnWebServer, spawnWebServer } from './services/webserver/webserver';
import { OpenAPIBackend } from 'openapi-backend/backend';

export const main = (deps: {
  backendEngine: typeof OpenAPIBackend;
  cors: typeof cors;
  express: typeof express;
  spawnAPIBackend: (deps: {
    backendEngine: typeof OpenAPIBackend;
  }) => Promise<OpenAPIBackend>;
  spawnWebServer: SpawnWebServer;
}) => {
  console.debug('Main()');
  return deps
    .spawnAPIBackend({ backendEngine: OpenAPIBackend })
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
  });
}
