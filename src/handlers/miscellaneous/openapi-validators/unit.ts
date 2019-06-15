import tape from 'tape';

import * as testedModule from './handler';

tape('OpenAPI Validators', (functions: tape.Test) => {
  functions.test('validationFail()', (test: tape.Test) =>
    testedModule.validationFail({ validation: { errors: ['foo'] } }, '', {
      status: (returnedStatus: number) => ({
        json: (returnedJSON: { err: Array<any> }) => {
          test.plan(3);
          test.equal(
            returnedStatus,
            400,
            'SHOULD sucessfully return a 400 response',
          );
          test.equal(
            !!returnedJSON,
            true,
            'SHOULD sucessfully return a JSON body',
          );
          test.deepEqual(
            returnedJSON,
            { err: ['foo'] },
            'SHOULD sucessfully return a body listing validation errors',
          );
          test.end();
        },
      }),
    }),
  );

  functions.test('notFound()', (test: tape.Test) =>
    testedModule.notFound('', '', {
      status: (returnedStatus: number) => ({
        json: (returnedJSON: { err: string }) => {
          test.plan(3);
          test.equal(
            returnedStatus,
            404,
            'SHOULD sucessfully return a 404 response',
          );
          test.equal(
            !!returnedJSON,
            true,
            'SHOULD sucessfully return a JSON body',
          );
          test.deepEqual(
            returnedJSON,
            { err: 'not found' },
            'SHOULD sucessfully return a body having a err property',
          );
          test.end();
        },
      }),
    }),
  );
});
