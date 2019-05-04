import tape from 'tape';
import * as testedModule from './index';

tape('Index script', (test: tape.Test) => {
  test.plan(2);
  testedModule.main({
    spawnAPIBackend: () => {
      test.pass('main SHOULD spawn an OpenAPI back-end');
      return Promise.resolve();
    },
    spawnWebServer: () => {
      test.pass('main SHOULD spawn a Web Server');
      test.end();
    },
  } as any);
});
