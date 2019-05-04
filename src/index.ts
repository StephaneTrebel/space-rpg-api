import { spawnAPIBackend } from './services/openapi-backend/openapi-backend';
import { spawnWebServer } from './services/webserver/webserver';
import { OpenAPIBackend } from 'openapi-backend/backend';

interface MainDeps {
  spawnAPIBackend: () => Promise<OpenAPIBackend>;
  spawnWebServer: any;
}

export const main = (deps: MainDeps = { spawnAPIBackend, spawnWebServer }) => {
  console.debug('Main()');
  return deps
    .spawnAPIBackend()
    .then((api: OpenAPIBackend) => deps.spawnWebServer(api));
};

if (process.env.NODE_ENV === 'production') {
  main();
}
