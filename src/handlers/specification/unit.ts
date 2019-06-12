import tape from 'tape';

import * as testedModule from './handler';

tape('Root handler', (functions: tape.Test) => {
  functions.test('root()', (test: tape.Test) => {
    const handlerResponse = testedModule.getSpecification({
      definition: 'foo',
    } as any)();
    test.plan(3);
    test.equal(
      handlerResponse.status,
      200,
      'SHOULD sucessfully return a 200 response',
    );
    test.equal(
      handlerResponse.json.specification,
      'foo',
      'SHOULD sucessfully return a body having a specification property',
    );
    test.deepEqual(
      handlerResponse.json.links,
      [
        {
          href: '/',
          rel: 'root',
        },
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
