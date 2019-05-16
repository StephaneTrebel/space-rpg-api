import tape from 'tape';

import { configServiceFactory } from '../config/config';
import { loggerServiceFactory } from '../logger/logger';
import { EMPTY_STATE, stateServiceFactory } from '../state/state';

import * as testedModule from './time';

tape('Time Service', (functions: tape.Test) => {
  functions.test('getTimeConfig()', (cases: tape.Test) => {
    cases.test('WHEN given a global config', (test: tape.Test) => {
      test.plan(1);
      const TIME_CONFIG: testedModule.TimeConfig = {
        period: 456,
        startDelay: 123,
      };
      test.deepEqual(
        testedModule.getTimeConfig(configServiceFactory({ time: TIME_CONFIG })),
        TIME_CONFIG,
        'SHOULD retrieve its time configuration',
      );
      test.end();
    });
  });
  functions.test('addAction()', (cases: tape.Test) => {
    cases.test('WHEN given an action queue', (test: tape.Test) => {
      test.plan(1);
      const action: testedModule.Action = 'foo' as any;
      test.deepEqual(
        testedModule.addAction(['bar' as any])(action),
        ['bar' as any, action],
        'SHOULD add an Action to its action queue',
      );
      test.end();
    });
  });
  functions.test('createTimer()', (cases: tape.Test) => {
    cases.test(
      'WHEN given no timer config AND a callback function',
      (test: tape.Test) => {
        test.plan(1);
        const fn = () => {
          test.pass('SHOULD create an Observable that emits one value');
          test.end();
        };
        testedModule.createTimer()(fn);
      },
    );
  });
  functions.test('timeServiceFactory()', (cases: tape.Test) => {
    cases.test(
      'WHEN 2 actions are added to its action queue',
      (test: tape.Test) => {
        test.plan(2);
        const START_DELAY = 100;
        const PERIOD = 100;
        const action1: testedModule.Action = () =>
          Promise.resolve(test.pass('SHOULD eventually execute the first one'));
        const action2: testedModule.Action = () =>
          Promise.resolve(
            test.pass('SHOULD eventually execute the second one'),
          );
        const timeService = testedModule.timeServiceFactory({
          configService: configServiceFactory({
            time: {
              period: PERIOD,
              startDelay: START_DELAY,
            },
          }),
          loggerService: loggerServiceFactory(),
          stateService: stateServiceFactory(EMPTY_STATE),
        });
        timeService.addAction(action1);
        timeService.addAction(action2);
        timeService.start();
        setTimeout(() => {
          timeService.stop();
          test.end();
        }, START_DELAY + PERIOD + 100);
      },
    );
    cases.test(
      'WHEN 2 actions are added to its action queue, AND then after a while two more are added',
      (test: tape.Test) => {
        test.plan(4);
        const START_DELAY = 100;
        const PERIOD = 100;
        const action1: testedModule.Action = () =>
          Promise.resolve(test.pass('SHOULD eventually execute the first one'));
        const action2: testedModule.Action = () =>
          Promise.resolve(
            test.pass('SHOULD eventually execute the second one'),
          );
        const action3: testedModule.Action = () =>
          Promise.resolve(test.pass('SHOULD eventually execute the third one'));
        const action4: testedModule.Action = () =>
          Promise.resolve(
            test.pass('SHOULD eventually execute the fourth one'),
          );
        const timeService = testedModule.timeServiceFactory({
          configService: configServiceFactory({
            time: {
              period: PERIOD,
              startDelay: START_DELAY,
            },
          }),
          loggerService: loggerServiceFactory(),
          stateService: stateServiceFactory(EMPTY_STATE),
        });
        timeService.addAction(action1);
        timeService.addAction(action2);
        timeService.start();
        setTimeout(() => {
          timeService.addAction(action3);
          timeService.addAction(action4);
        }, START_DELAY + PERIOD + 100);
        setTimeout(() => {
          timeService.stop();
          test.end();
        }, START_DELAY + PERIOD * 2 + 100);
      },
    );
  });
});
