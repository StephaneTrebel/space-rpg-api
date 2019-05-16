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
  functionTest.test('GIVEN an action list AND a period', (test: tape.Test) => {
    test.plan(1);
    const START_DELAY = 100;
    const PERIOD = 100;
    const action: testedModule.Action = (_ignore: StateService) =>
      Promise.resolve(
        test.pass(
          'SHOULD execute the action list after the period has elapsed',
        ),
      );
    const timeService = testedModule.timeServiceFactory(
      stateServiceFactory(EMPTY_STATE),
      PERIOD,
      START_DELAY,
    );
    timeService.addAction(action);
    timeService.start();
    setTimeout(() => {
      timeService.stop();
      test.end();
    }, START_DELAY + PERIOD + 100);
  });
});
