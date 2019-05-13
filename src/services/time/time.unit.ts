import tape from 'tape';

import * as testedModule from './time';

tape('Time Service', (functionTest: tape.Test) => {
  functionTest.test('addAction()', (test: tape.Test) => {
    test.plan(1);
    const action: testedModule.Action = 'foo' as any;
    test.deepEqual(
      testedModule.timeServiceFactory().addAction(action),
      [action],
      'addAction() SHOULD add an Action to its action queue',
    );
    test.end();
  });
});
