import tape from 'tape';

import { EMPTY_STATE, stateServiceFactory, StateService } from '../state/state';

import * as testedModule from './time';

tape('Time Service', (functionTest: tape.Test) => {
  functionTest.test('addAction()', (test: tape.Test) => {
    test.plan(1);
    const action: testedModule.Action = 'foo' as any;
    test.deepEqual(
      testedModule
        .timeServiceFactory(stateServiceFactory(EMPTY_STATE))
        .addAction(action),
      [action],
      'addAction() SHOULD add an Action to its action queue',
    );
    test.end();
  });
  functionTest.test('executeActionList()', (test: tape.Test) => {
    test.plan(1);
    const action: testedModule.Action = (_ignore: StateService) => {
      test.pass(
        'executeActionList() SHOULD execute every action in its internal queue',
      );
      test.end();
      return Promise.resolve();
    };
    const timeService = testedModule.timeServiceFactory(
      stateServiceFactory(EMPTY_STATE),
    );
    timeService.addAction(action);
    timeService.executeActionList();
  });
});
