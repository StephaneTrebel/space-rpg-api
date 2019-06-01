import tape from 'tape';

import { configServiceFactory } from '../config/service';
import { loggerServiceFactory } from '../logger/service';
import { EMPTY_STATE, stateServiceFactory } from '../state/service';

import { Action, ActionType, TimeConfig } from './types';

import * as testedModule from './service';

tape('Time Service', (functions: tape.Test) => {
  functions.test('createBaseActionMock()', (cases: tape.Test) => {
    cases.test('WHEN given no parameters', (test: tape.Test) => {
      test.plan(2);
      const displacement = testedModule.createBaseActionMock();
      test.deepEqual(
        displacement,
        testedModule.MOCK_BASE_ACTION,
        'SHOULD return a BaseAction mock object',
      );
      return displacement.executor({} as any).then(() => {
        test.pass(
          'this BaseAction mock object executor method should return a Promise',
        );
        test.end();
      });
    });
  });

  functions.test('getTimeConfig()', (cases: tape.Test) => {
    cases.test('WHEN given a global config', (test: tape.Test) => {
      test.plan(1);
      const TIME_CONFIG: TimeConfig = {
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
      const action: Action = 'foo' as any;
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

  functions.test('getAction()', (given: tape.Test) => {
    given.test('GIVEN an action that does not exist', (when: tape.Test) => {
      when.test('WHEN called with its id', (test: tape.Test) => {
        test.plan(1);
        test.throws(
          () =>
            testedModule.getAction([
              testedModule.createBaseActionMock({
                ...testedModule.MOCK_BASE_ACTION,
                executor: undefined as any,
                id: 'foo',
              }),
            ])({ id: 'bar', type: testedModule.MOCK_BASE_ACTION.type }),
          'SHOULD throw an error',
        );
        test.end();
      });
    });

    given.test('GIVEN an action that does exist', (when: tape.Test) => {
      when.test(
        'WHEN called with its id and another action type',
        (test: tape.Test) => {
          test.plan(1);
          const action = testedModule.createBaseActionMock({
            ...testedModule.MOCK_BASE_ACTION,
            executor: undefined as any,
            id: 'foo',
          });
          test.throws(
            () =>
              testedModule.getAction([action])({
                id: 'foo',
                type: ActionType.NONE,
              }),
            'SHOULD throw an error',
          );
          test.end();
        },
      );

      when.test(
        'WHEN called with its id and the same action type',
        (test: tape.Test) => {
          test.plan(1);
          const action = testedModule.createBaseActionMock({
            ...testedModule.MOCK_BASE_ACTION,
            executor: undefined as any,
            id: 'foo',
          });
          test.equal(
            testedModule.getAction([action])({
              id: 'foo',
              type: action.type,
            }),
            action,
            'SHOULD return the action',
          );
          test.end();
        },
      );
    });
  });

  functions.test('timeServiceFactory()', (cases: tape.Test) => {
    cases.test(
      'WHEN 2 actions are added to its action queue',
      (test: tape.Test) => {
        test.plan(2);
        const START_DELAY = 100;
        const PERIOD = 100;
        const loggerService = loggerServiceFactory();
        const timeService = testedModule.timeServiceFactory({
          configService: configServiceFactory({
            time: {
              period: PERIOD,
              startDelay: START_DELAY,
            },
          }),
          loggerService,
          stateService: stateServiceFactory({ loggerService })(EMPTY_STATE),
        })();
        timeService.addAction(
          testedModule.createBaseActionMock({
            ...testedModule.MOCK_BASE_ACTION,
            executor: () =>
              Promise.resolve(
                test.pass('SHOULD eventually execute the first one'),
              ),
            id: 'foo',
          }),
        );
        timeService.addAction(
          testedModule.createBaseActionMock({
            ...testedModule.MOCK_BASE_ACTION,
            executor: () =>
              Promise.resolve(
                test.pass('SHOULD eventually execute the second one'),
              ),
            id: 'bar',
          }),
        );
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
        const loggerService = loggerServiceFactory();
        const timeService = testedModule.timeServiceFactory({
          configService: configServiceFactory({
            time: {
              period: PERIOD,
              startDelay: START_DELAY,
            },
          }),
          loggerService,
          stateService: stateServiceFactory({ loggerService })(EMPTY_STATE),
        })();
        timeService.addAction(
          testedModule.createBaseActionMock({
            ...testedModule.MOCK_BASE_ACTION,
            executor: () =>
              Promise.resolve(
                test.pass('SHOULD eventually execute the first one'),
              ),
            id: 'foo',
          }),
        );
        timeService.addAction(
          testedModule.createBaseActionMock({
            ...testedModule.MOCK_BASE_ACTION,
            executor: () =>
              Promise.resolve(
                test.pass('SHOULD eventually execute the second one'),
              ),
            id: 'bar',
          }),
        );
        timeService.start();
        setTimeout(() => {
          timeService.addAction(
            testedModule.createBaseActionMock({
              ...testedModule.MOCK_BASE_ACTION,
              executor: () =>
                Promise.resolve(
                  test.pass('SHOULD eventually execute the third one'),
                ),
              id: 'baz',
            }),
          );
          timeService.addAction(
            testedModule.createBaseActionMock({
              ...testedModule.MOCK_BASE_ACTION,
              executor: () =>
                Promise.resolve(
                  test.pass('SHOULD eventually execute the fourth one'),
                ),
              id: 'qux',
            }),
          );
        }, START_DELAY + PERIOD + 100);
        setTimeout(() => {
          timeService.stop();
          test.end();
        }, START_DELAY + PERIOD * 2 + 100);
      },
    );
  });
});
