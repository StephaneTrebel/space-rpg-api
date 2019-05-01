import { spawnAPIBackend } from './services/openapi-backend/openapi-backend';
import { spawnWebServer } from './services/webserver/webserver';

export const main = () => {
  console.debug('Main()');
  spawnAPIBackend().then(spawnWebServer);
};

// if ((process.env.NODE_ENV === 'production')) {
main();
// }
