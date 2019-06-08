import http from 'http';

import express from 'express';
import * as OpenAPIBackend from 'openapi-backend';

import { LinkList } from './types';

export type SpawnWebServer = (deps: {
  cors: () => any;
  express: typeof express;
}) => (api: {
  handleRequest: (
    baseReq: OpenAPIBackend.Request,
    req: express.Request,
    res: express.Response,
  ) => void;
}) => http.Server;
export const spawnWebServer: SpawnWebServer = deps => api =>
  deps
    .express()
    .use(deps.express.json())
    .use(deps.cors())
    // Both "req" arguments are justified: the first one is the Request that
    // OpenAPI-backend will use, the second one will be the first argument passed
    // on to handlers.
    .use((req, res) => api.handleRequest(req as any, req, res))
    .listen(9000);

type SendResponse = (
  res: express.Response,
) => (params: {
  status: number;
  payload: any;
  links?: LinkList;
}) => express.Response;
export const sendResponse: SendResponse = res => handlerResponse =>
  res.status(handlerResponse.status).json({
    ...handlerResponse.payload,
    links: handlerResponse.links,
  });
