import cors from 'cors';
import express from 'express';
import { OpenAPIBackend, Request } from 'openapi-backend';

export const spawnWebServer = (api: OpenAPIBackend) => {
  console.debug('spawnWebServer()');
  return (
    express()
      .use(express.json())
      .use(cors())
      // Both "req" arguments are justified: the first one is the Request that
      // OpenAPI-backend will use, the second one will be the first argument passed
      // on to handlers.
      .use((req, res) => api.handleRequest(req as Request, req, res))
      .listen(9000, () => console.log('Server started'))
  );
};
