import tape from 'tape';
import * as testedModule from './create';

tape('Player creation handler', (t: tape.Test) => {
  t.test('createPlayer()', (test: tape.Test) =>
    testedModule.createPlayer('', '', {
      status: (returnedStatus: number) => ({
        json: (returnedJSON: {
          links: Array<{ href: string; rel: string }>;
          username: string;
        }) => {
          test.plan(3);
          test.equal(
            returnedStatus,
            201,
            'root SHOULD sucessfully return a 201 response',
          );
          test.equal(
            typeof returnedJSON.username,
            'string',
            'root SHOULD sucessfully return a body having a username property',
          );
          test.deepEqual(
            returnedJSON.links,
            [
              {
                href: '/self-health/ping',
                rel: 'ping',
              },
            ],
            'root SHOULD sucessfully return a body having a link to Self-Health Ping endpoint',
          );
          test.end();
        },
      }),
    }),
  );
});
