import { spawnAPIBackend } from './services/openapi-backend/openapi-backend';
import { spawnWebServer } from './services/webserver/webserver';
import { OpenAPIBackend } from 'openapi-backend/backend';

export const main = (deps: {
  spawnAPIBackend: () => Promise<OpenAPIBackend>;
  spawnWebServer: any;
}) => {
  console.debug('Main()');
  return deps
    .spawnAPIBackend()
    .then((api: OpenAPIBackend) => deps.spawnWebServer(api));
};

// istanbul ignore if
if (process.env.NODE_ENV === 'production') {
  main({spawnAPIBackend, spawnWebServer});
}
