import fs from 'fs';
import http from 'http';

import express from 'express';
import * as OpenAPIBackend from 'openapi-backend';

import { ConfigService } from '../config/types';
import { LoggerService } from '../logger/types';

export const swaggerUIEndpoint = '/swagger-ui';

export type SpawnWebServer = (deps: {
  configService: ConfigService;
  cors: () => any;
  express: typeof express;
  loggerService: LoggerService;
}) => (api: {
  handleRequest: (
    baseReq: OpenAPIBackend.Request,
    req: express.Request,
    res: express.Response,
  ) => void;
}) => http.Server;
export const spawnWebServer: SpawnWebServer = deps => api => {
  const swaggerUIAssetPath = require('swagger-ui-dist').getAbsoluteFSPath();
  const indexContent = fs
    .readFileSync(`${swaggerUIAssetPath}/index.html`)
    .toString()
    .replace(
      'https://petstore.swagger.io/v2/swagger.json',
      deps.configService.getURL('/specification'),
    );
  return (
    deps
      .express()
      .use(deps.express.json())
      .use(deps.cors())
      // To properly use our specification in SwaggerUI, we have to manually
      // override the index.html endpoint to use our custom one.
      .get(`${swaggerUIEndpoint}/`, (_req, res) => res.send(indexContent))
      .get(`${swaggerUIEndpoint}/index.html`, (_req, res) =>
        res.send(indexContent),
      )
      // This is the main SwaggerUI endpoint, from which all static assets will
      // be loaded
      .use(`${swaggerUIEndpoint}`, deps.express.static(swaggerUIAssetPath))
      // Here, both "req" arguments are justified: the first one is the Request
      // that OpenAPI-backend will use, the second one will be the first argument
      // passed on to handlers.
      .use((req, res) => api.handleRequest(req as any, req, res))
      .listen(deps.configService.getServerConfig().port, () =>
        deps.loggerService.info(
          `Listening on ${deps.configService.getURL('/')}`,
        ),
      )
  );
};
