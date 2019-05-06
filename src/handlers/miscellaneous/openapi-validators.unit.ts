import tape from 'tape';
import * as testedModule from './openapi-validators';

tape('OpenAPI Validators', (t: tape.Test) => {
  t.test('validationFail()', (test: tape.Test) =>
    testedModule.validationFail({ validation: { errors: ['foo'] } }, '', {
      status: (returnedStatus: number) => ({
        json: (returnedJSON: { err: Array<any> }) => {
          test.plan(3);
          test.equal(
            returnedStatus,
            400,
            'validationFail SHOULD sucessfully return a 400 response',
          );
          test.equal(
            !!returnedJSON,
            true,
            'validationFail SHOULD sucessfully return a JSON body',
          );
          test.deepEqual(
            returnedJSON,
            { err: ['foo'] },
            'validationFail SHOULD sucessfully return a body listing validation errors',
          );
          test.end();
        },
      }),
    }),
  );

  t.test('notFound()', (test: tape.Test) =>
    testedModule.notFound('', '', {
      status: (returnedStatus: number) => ({
        json: (returnedJSON: { err: string }) => {
          test.plan(3);
          test.equal(
            returnedStatus,
            404,
            'validationFail SHOULD sucessfully return a 404 response',
          );
          test.equal(
            !!returnedJSON,
            true,
            'validationFail SHOULD sucessfully return a JSON body',
          );
          test.deepEqual(
            returnedJSON,
            { err: 'not found' },
            'validationFail SHOULD sucessfully return a body having a err property',
          );
          test.end();
        },
      }),
    }),
  );

  t.test('notImplemented()', (test: tape.Test) =>
    testedModule.notImplemented(
      {
        api: {
          mockResponseForOperation: () => ({
            mock: { result: 'bar' },
            status: 123,
          }),
        },
        operation: 'foo',
      },
      '',
      {
        status: (returnedStatus: number) => ({
          json: (returnedJSON: { result: string }) => {
            test.plan(2);
            test.equal(
              returnedStatus,
              123,
              'notImplemented SHOULD sucessfully return the mocked status',
            );
            test.deepEqual(
              returnedJSON,
              { result: 'bar' },
              'notImplemented SHOULD sucessfully return a body having the expected properties',
            );
            test.end();
          },
        }),
      },
    ),
  );
});
