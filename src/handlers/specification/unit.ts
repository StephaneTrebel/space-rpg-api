import tape from 'tape';

import * as testedModule from './handler';

tape('Specification handler', (functions: tape.Test) => {
  functions.test('getSpecification()', (test: tape.Test) => {
    const handlerResponse = testedModule.getSpecification({
      definition: 'foo',
    } as any)();
    test.plan(2);
    test.equal(
      handlerResponse.status,
      200,
      'SHOULD sucessfully return a 200 response',
    );
    test.equal(
      handlerResponse.json,
      'foo',
      'SHOULD sucessfully return a body having a specification property',
    );
    test.end();
  });
});
