import tape from 'tape';

import * as testedModule from './utils';

tape('Player handler', (functions: tape.Test) => {
  functions.test('getPropertyFromContextRequest()', (cases: tape.Test) => {
    cases.test(
      'WHEN called with a property code a Context object lacking request parameters',
      (test: tape.Test) => {
        test.plan(1);
        const context: any = {
          request: {},
        };
        test.throws(
          () => testedModule.getPropertyFromContextRequest('foo')(context),
          'SHOULD throw an error',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN called with a property code a Context object having non-string request parameters',
      (test: tape.Test) => {
        test.plan(1);
        const foo = ['bar', 'baz'];
        const context: any = {
          request: { params: foo },
        };
        test.throws(
          () => testedModule.getPropertyFromContextRequest('foo')(context),
          'SHOULD throw an error',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN called with a property code a Context object',
      (test: tape.Test) => {
        test.plan(1);
        const foo = 'bar';
        const context: any = {
          request: { params: { foo } },
        };
        test.equal(
          testedModule.getPropertyFromContextRequest('foo')(context),
          foo,
          'SHOULD return the related Context property value',
        );
        test.end();
      },
    );
  });
});
