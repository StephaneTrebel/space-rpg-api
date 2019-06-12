import tape from 'tape';

import * as testedModule from './handler';

tape('Root handler', (functions: tape.Test) => {
  functions.test('root()', (test: tape.Test) => {
    const handlerResponse = testedModule.root();
    test.plan(3);
    test.equal(
      handlerResponse.status,
      200,
      'SHOULD sucessfully return a 200 response',
    );
    test.equal(
      typeof handlerResponse.json.message,
      'string',
      'SHOULD sucessfully return a body having a message',
    );
    test.deepEqual(
      handlerResponse.json.links,
      [
        {
          href: '/self-health/ping',
          rel: 'ping',
        },
      ],
      'SHOULD sucessfully return a body having a link to Self-Health Ping endpoint',
    );
    test.end();
  });
});
