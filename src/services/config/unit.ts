import tape from 'tape';

import * as testedModule from './service';

tape('Config service', (fnTest: tape.Test) => {
  fnTest.test('get()', (caseTest: tape.Test) => {
    caseTest.test('WHEN given a configuration', (test: tape.Test) => {
      test.plan(1);
      test.equal(
        testedModule
          .configServiceFactory({
            logger: {
              console: true,
            },
          })
          .get('logger.console'),
        true,
        'get() SHOULD retrieve expected property',
      );
      test.end();
    });
  });
});
