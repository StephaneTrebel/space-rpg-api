import { spawnAPIBackend } from './services/openapi-backend/openapi-backend';
import { spawnWebServer } from './services/webserver/webserver';
import { OpenAPIBackend } from 'openapi-backend/backend';

export const main = (deps: {
  spawnAPIBackend: (
    backendEngine: typeof OpenAPIBackend,
  ) => Promise<OpenAPIBackend>;
  spawnWebServer: any;
}) => {
  console.debug('Main()');
  return deps
    .spawnAPIBackend(OpenAPIBackend)
    .then((api: OpenAPIBackend) => deps.spawnWebServer(api));
};

// istanbul ignore if
if (process.env.NODE_ENV === 'production') {
  main({
    spawnAPIBackend: spawnAPIBackend({ backendEngine: OpenAPIBackend }),
    spawnWebServer,
  });
}
