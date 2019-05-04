import tape from 'tape';
import * as testedModule from './self-health';

tape('Self-health handler', (test: tape.Test) => {
  test.plan(3);
  testedModule.selfHealthPing('', '', {
    status: (returnedStatus: number) => ({
      json: (returnedJSON: { message: string }) => {
        if (returnedStatus === 200) {
          test.pass('selfHealthPing SHOULD sucessfully return a 200 response');
        }
        if (returnedJSON) {
          test.pass('selfHealthPing SHOULD sucessfully return a body');
        }
        if (returnedJSON.message) {
          test.pass('selfHealthPing SHOULD sucessfully return a body having a message');
        }
        test.end();
      },
    }),
  });
});
