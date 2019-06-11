import tape from 'tape';

import { configServiceFactory } from '../config/service';
import { loggerServiceFactory } from '../logger/service';
import { stateServiceFactory, EMPTY_STATE } from '../state/service';
import { timeServiceFactory } from '../time/service';

import * as testedModule from './service';

tape('OpenAPI Backend', (functions: tape.Test) => {
  functions.test('createBackend()', (given: tape.Test) => {
    given.test('GIVEN improper dependencies', (when: tape.Test) => {
      when.test('WHEN called with a specification', (test: tape.Test) => {
        test.plan(1);
        // tslint:disable-next-line:max-classes-per-file
        class MockBackEndEngine {
          constructor() {
            return;
          }
          public register() {
            throw new Error('NOPE');
          }
        }
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })(
          EMPTY_STATE,
        );
        return testedModule
          .createBackend({
            backendEngine: MockBackEndEngine as any,
            loggerService,
            stateService,
            timeService: timeServiceFactory({
              configService: configServiceFactory(),
              loggerService: loggerServiceFactory(),
              stateService,
            })(),
          })('foo')
          .catch(() => {
            test.pass('SHOULD eventually return an error');
            test.end();
          });
      });
    });

    given.test('GIVEN proper dependencies', (when: tape.Test) => {
      when.test('WHEN called with a specification', (test: tape.Test) => {
        test.plan(2);
        // tslint:disable-next-line:max-classes-per-file
        class MockBackEndEngine {
          constructor() {
            return;
          }
          public register() {
            test.pass('SHOULD register handlers');
          }
          public init() {
            return Promise.resolve(
              test.pass('SHOULD initialize the OpenAPI Backend'),
            );
          }
        }
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })(
          EMPTY_STATE,
        );
        return testedModule
          .createBackend({
            backendEngine: MockBackEndEngine as any,
            loggerService,
            stateService,
            timeService: timeServiceFactory({
              configService: configServiceFactory(),
              loggerService: loggerServiceFactory(),
              stateService,
            })(),
          })('foo')
          .then(() => test.end());
      });
    });
  });

  functions.test('spawnAPIBackend()', (given: tape.Test) => {
    given.test('GIVEN proper dependencies', (when: tape.Test) => {
      when.test('WHEN called with these dependencies', (test: tape.Test) => {
        test.plan(2);
        // tslint:disable-next-line:max-classes-per-file
        class MockBackEndEngine {
          constructor() {
            return;
          }

          public register() {
            test.pass('SHOULD register handlers');
          }

          public init() {
            return Promise.resolve(
              test.pass('SHOULD initialize the OpenAPI Backend'),
            );
          }
        }

        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })(
          EMPTY_STATE,
        );
        return testedModule
          .spawnAPIBackend({
            backendEngine: MockBackEndEngine as any,
            loggerService,
            stateService,
            timeService: timeServiceFactory({
              configService: configServiceFactory(),
              loggerService: loggerServiceFactory(),
              stateService,
            })(),
          })
          .then(() => test.end());
      });
    });
  });
});
