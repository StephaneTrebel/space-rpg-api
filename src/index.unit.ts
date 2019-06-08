import tape from 'tape';

import { EMPTY_UNIVERSE } from './assets/universe';
import { DEFAULT_CONFIG } from './services/config/service';

import * as testedModule from './index';

tape('Index script', (subTest: tape.Test) => {
  subTest.test('WHEN main function is called', (test: tape.Test) => {
    test.plan(2);
    testedModule
      .main({
        spawnAPIBackend: () => {
          test.pass('SHOULD spawn an OpenAPI back-end');
          return Promise.resolve();
        },
        spawnWebServer: () => () => {
          test.pass('main SHOULD spawn a Web Server');
          test.end();
        },
      } as any)({ config: DEFAULT_CONFIG })(EMPTY_UNIVERSE)
      .then(assets => assets.teardown());
  });

  subTest.test(
    'WHEN main function is called with startTime to true',
    (test: tape.Test) => {
      test.plan(2);
      testedModule.main({
        spawnAPIBackend: () => {
          test.pass('SHOULD spawn an OpenAPI back-end');
          return Promise.resolve();
        },
        spawnWebServer: () => () => {
          test.pass('main SHOULD spawn a Web Server');
          test.end();
        },
      } as any)({ config: DEFAULT_CONFIG, startTime: true })(EMPTY_UNIVERSE);
    },
  );
});
