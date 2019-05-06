import http from 'http';

import express from 'express';

type Callable<T> = () => T;

interface ExpressDep extends Callable<ExpressDep> {
  json: () => ExpressDep;
  listen: (port: number, callback?: () => void) => http.Server;
  use: (handler: express.RequestHandler) => ExpressDep;
}

export const spawnWebServer = (deps: {
  cors: () => any;
  express: ExpressDep;
}) => (api: {
  handleRequest: (
    baseReq: express.Request,
    req: express.Request,
    res: express.Response,
  ) => void;
}) => {
  console.debug('spawnWebServer()');
  return (
    deps
      .express()
      .use(deps.express.json())
      .use(deps.cors())
      // Both "req" arguments are justified: the first one is the Request that
      // OpenAPI-backend will use, the second one will be the first argument passed
      // on to handlers.
      .use((req, res) => api.handleRequest(req, req, res))
      .listen(9000, () => console.log('Server started'))
  );
};
