import tape from 'tape';

import { createDisplacementMock } from '../../utils/displacememt/utils';

import { configServiceFactory, DEFAULT_CONFIG } from '../config/service';
import { loggerServiceFactory } from '../logger/service';
import { EMPTY_STATE, stateServiceFactory } from '../state/service';

import { TimeConfig } from './types';

import * as testedModule from './service';

tape('Time Service', (functions: tape.Test) => {
  functions.test('getTimeConfig()', (cases: tape.Test) => {
    cases.test('WHEN given a global config', (test: tape.Test) => {
      test.plan(1);
      const TIME_CONFIG: TimeConfig = {
        period: 456,
        startDelay: 123,
      };
      test.deepEqual(
        testedModule.getTimeConfig(
          configServiceFactory({ ...DEFAULT_CONFIG, time: TIME_CONFIG }),
        ),
        TIME_CONFIG,
        'SHOULD retrieve its time configuration',
      );
      test.end();
    });
  });

  functions.test('createTimer()', (cases: tape.Test) => {
    cases.test(
      'WHEN given a time config and any function',
      (test: tape.Test) => {
        test.plan(3);
        const subscription = testedModule.createTimer({
          timerFn: () =>
            ({
              subscribe: (fn: any) => {
                test.pass('SHOULD subscribe to an Observable');
                fn();
                return 'subscription';
              },
            } as any),
        })({
          fn: () => {
            test.pass('SHOULD eventually execute given function');
          },
          timeConfig: testedModule.MOCK_TIME_CONFIG,
        });
        test.equal(
          subscription,
          'subscription',
          'SHOULD return a subscription to an Observable',
        );
        test.end();
      },
    );
  });

  functions.test('findAction()', (cases: tape.Test) => {
    cases.test(
      `WHEN called with the TimeService internal object
    AND an unknown action id`,
      (test: tape.Test) => {
        test.plan(1);
        const id = 'myUnknownId';
        const loggerService = loggerServiceFactory();
        test.throws(
          () =>
            testedModule.findAction({ loggerService })({
              actionQueue: [
                createDisplacementMock({
                  id,
                }),
              ],
              processQueue: [],
            })(id + 'lol'),
          'SHOULD throw an error',
        );
        test.end();
      },
    );

    cases.test(
      `WHEN called with the TimeService internal object
    AND a known action id`,
      (test: tape.Test) => {
        test.plan(1);
        const id = 'myAwesomeId';
        const action = createDisplacementMock({
          id,
        });
        const loggerService = loggerServiceFactory();
        test.equal(
          testedModule.findAction({ loggerService })({
            actionQueue: [action],
            processQueue: [],
          })(id),
          action,
          'SHOULD return the related action',
        );
        test.end();
      },
    );
  });

  functions.test('addAction()', (cases: tape.Test) => {
    cases.test(
      `WHEN called with the TimeService internal object
    AND a new action for a an entity that already has a registered action`,
      (test: tape.Test) => {
        test.plan(1);
        const displacementA = createDisplacementMock({
          entityId: 'alpha',
          id: 'foo',
        });
        const displacementBOld = createDisplacementMock({
          entityId: 'beta',
          id: 'oldB',
        });
        const displacementBNew = createDisplacementMock({
          entityId: 'beta',
          id: 'newB',
        });
        const loggerService = loggerServiceFactory();
        test.deepEqual(
          testedModule.addAction({ loggerService })({
            actionQueue: [displacementA, displacementBOld],
            processQueue: [],
          })(displacementBNew),
          [displacementA, displacementBNew],
          'SHOULD replace the existing action with the new one in the action queue',
        );
        test.end();
      },
    );

    cases.test(
      `WHEN called with the TimeService internal object
    AND a new action for an entity that has no registered action`,
      (test: tape.Test) => {
        test.plan(1);
        const displacementA = createDisplacementMock({
          entityId: 'alpha',
          id: 'foo',
        });
        const displacementB = createDisplacementMock({
          entityId: 'beta',
          id: 'bar',
        });
        const displacementC = createDisplacementMock({
          entityId: 'gamma',
          id: 'baz',
        });
        const loggerService = loggerServiceFactory();
        test.deepEqual(
          testedModule.addAction({ loggerService })({
            actionQueue: [displacementB, displacementC],
            processQueue: [],
          })(displacementA),
          [displacementB, displacementC, displacementA],
          'SHOULD add an Action to its action queue',
        );
        test.end();
      },
    );
  });

  functions.test('cancelAction()', (cases: tape.Test) => {
    cases.test(
      `WHEN called with the TimeService internal object
    AND a known action id`,
      (test: tape.Test) => {
        test.plan(1);
        const displacementA = createDisplacementMock({ id: 'foo' });
        const displacementB = createDisplacementMock({ id: 'bar' });
        const displacementC = createDisplacementMock({ id: 'baz' });
        const loggerService = loggerServiceFactory();
        test.deepEqual(
          testedModule.cancelAction({ loggerService })({
            actionQueue: [displacementA, displacementB, displacementC],
            processQueue: [],
          })(displacementB.id),
          [displacementA, displacementC],
          'SHOULD remove an Action from the action queue',
        );
        test.end();
      },
    );
  });

  functions.test('start()', (cases: tape.Test) => {
    cases.test(
      `WHEN called with the TimeService internal object`,
      (test: tape.Test) => {
        test.plan(4);
        const configService = configServiceFactory(DEFAULT_CONFIG);
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })(
          EMPTY_STATE,
        );
        const timeService = testedModule.timeServiceFactory({
          configService,
          loggerService,
          stateService,
        })();
        const internal = {
          actionQueue: [
            createDisplacementMock({
              executor: () =>
                Promise.resolve(test.pass('SHOULD execute the first action')),
            }),
            createDisplacementMock({
              executor: () =>
                Promise.resolve(test.pass('SHOULD execute the second action')),
            }),
            createDisplacementMock({
              executor: () =>
                Promise.resolve(test.pass('SHOULD execute the third action')),
            }),
          ],
          processQueue: [],
        };
        testedModule.start({
          configService,
          createTimerFn: (() => ({ fn }: any) => {
            test.pass(
              'SHOULD create a timer to execute the processing function',
            );
            fn();
          }) as any,
          loggerService,
          stateService,
          timeService,
          timerFn: 'osef' as any,
        })(internal)();
        test.end();
      },
    );
  });

  functions.test('stop()', (cases: tape.Test) => {
    cases.test(
      `WHEN called with the internal object of a stopped TimeService`,
      (test: tape.Test) => {
        test.plan(1);
        const loggerService = loggerServiceFactory();
        const internal: any = {
          actionQueue: [],
          processQueue: [],
        };
        testedModule.stop({
          loggerService,
        })(internal)();
        test.pass('SHOULD do nothing');
        test.end();
      },
    );

    cases.test(
      `WHEN called with the internal object of a started TimeService`,
      (test: tape.Test) => {
        test.plan(1);
        const loggerService = loggerServiceFactory();
        const internal: any = {
          actionQueue: [],
          processQueue: [],
          timer: {
            unsubscribe: () => {
              test.pass('SHOULD unsubscribe the internal timer');
            },
          },
        };
        testedModule.stop({
          loggerService,
        })(internal)();
        test.end();
      },
    );
  });

  functions.test('Service tests', (cases: tape.Test) => {
    cases.test(
      'WHEN 2 actions are added to the TimeService action queue',
      (test: tape.Test) => {
        test.plan(2);
        const START_DELAY = 100;
        const PERIOD = 100;
        const loggerService = loggerServiceFactory();
        const timeService = testedModule.timeServiceFactory({
          configService: configServiceFactory({
            ...DEFAULT_CONFIG,
            time: {
              period: PERIOD,
              startDelay: START_DELAY,
            },
          }),
          loggerService,
          stateService: stateServiceFactory({ loggerService })(EMPTY_STATE),
        })();
        timeService.addAction(
          createDisplacementMock({
            entityId: 'alpha',
            executor: () =>
              Promise.resolve(
                test.pass('SHOULD eventually execute the first one'),
              ),
            id: 'foo',
          }),
        );
        timeService.addAction(
          createDisplacementMock({
            entityId: 'beta',
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
      `WHEN 2 actions are added to the TimeService action queue,
    AND then after a while two more are added`,
      (test: tape.Test) => {
        test.plan(4);
        const START_DELAY = 100;
        const PERIOD = 100;
        const loggerService = loggerServiceFactory();
        const timeService = testedModule.timeServiceFactory({
          configService: configServiceFactory({
            ...DEFAULT_CONFIG,
            time: {
              period: PERIOD,
              startDelay: START_DELAY,
            },
          }),
          loggerService,
          stateService: stateServiceFactory({ loggerService })(EMPTY_STATE),
        })();
        timeService.addAction(
          createDisplacementMock({
            entityId: 'alpha',
            executor: () =>
              Promise.resolve(
                test.pass('SHOULD eventually execute the first one'),
              ),
            id: 'foo',
          }),
        );
        timeService.addAction(
          createDisplacementMock({
            entityId: 'beta',
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
            createDisplacementMock({
              entityId: 'gamma',
              executor: () =>
                Promise.resolve(
                  test.pass('SHOULD eventually execute the third one'),
                ),
              id: 'baz',
            }),
          );
          timeService.addAction(
            createDisplacementMock({
              entityId: 'delta',
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
