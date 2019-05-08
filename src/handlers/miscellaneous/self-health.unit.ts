import tape from 'tape';
import * as testedModule from './self-health';

tape('Self-health handler', (t: tape.Test) => {
  t.test('selfHealthPing()', (test: tape.Test) =>
    testedModule.selfHealthPing('', '', {
      status: (returnedStatus: number) => ({
        json: (returnedJSON: { message: string }) => {
          test.plan(2);
          test.equal(
            returnedStatus,
            200,
            'SHOULD sucessfully return a 200 response',
          );
          test.deepEqual(
            returnedJSON,
            { message: 'pong' },
            'SHOULD sucessfully return a body having a message',
          );
          test.end();
        },
      }),
    }),
  );
});
