import tape from 'tape';
import * as testedModule from './root';

tape('Root handler', (t: tape.Test) => {
  t.test('root()', (test: tape.Test) =>
    testedModule.root('', '', {
      status: (returnedStatus: number) => ({
        json: (returnedJSON: {
          links: Array<{ href: string; rel: string }>;
          message: string;
        }) => {
          test.plan(3);
          test.equal(
            returnedStatus,
            200,
            'SHOULD sucessfully return a 200 response',
          );
          test.equal(
            typeof returnedJSON.message,
            'string',
            'SHOULD sucessfully return a body having a message',
          );
          test.deepEqual(
            returnedJSON.links,
            [
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
