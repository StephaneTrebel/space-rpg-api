import tape from 'tape';

import * as testedModule from './service';
import { Protocol } from '../webserver/types';

tape('Config service', (functions: tape.Test) => {
  functions.test('configService.get()', (given: tape.Test) => {
    given.test('GIVEN a configuration', (when: tape.Test) => {
      when.test('WHEN called with a configuration', (test: tape.Test) => {
        test.plan(1);
        test.equal(
          testedModule
            .configServiceFactory({
              ...testedModule.DEFAULT_CONFIG,
              logger: {
                console: true,
              },
            })
            .get('logger.console'),
          true,
          'SHOULD retrieve expected property',
        );
        test.end();
      });
    });

    functions.test('getURL()', (cases: tape.Test) => {
      cases.test(
        `WHEN called with a configuration
    AND an endpoint`,
        (test: tape.Test) => {
          test.plan(1);
          test.equal(
            testedModule.getURL({
              ...testedModule.DEFAULT_CONFIG,
              server: {
                host: 'toto',
                port: 1234,
                protocol: Protocol.HTTP,
              },
            })('/foo/bar'),
            'http://toto:1234/foo/bar',
            'SHOULD send back the computed URL',
          );
          test.end();
        },
      );
    });
  });
});
