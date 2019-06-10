import tape from 'tape';

import * as testedModule from './handler';

tape('Root handler', (functions: tape.Test) => {
  functions.test('root()', (test: tape.Test) =>
    testedModule.getSpecification({ document: 'foo' } as any)('', '', {
      status: (returnedStatus: number) => ({
        json: (returnedJSON: {
          links: Array<{ href: string; rel: string }>;
          specification: string;
        }) => {
          test.plan(3);
          test.equal(
            returnedStatus,
            200,
            'SHOULD sucessfully return a 200 response',
          );
          test.equal(
            returnedJSON.specification,
            'foo',
            'SHOULD sucessfully return a body having a specification property',
          );
          test.deepEqual(
            returnedJSON.links,
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
        },
      }),
    }),
  );
});
