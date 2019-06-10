import tape from 'tape';

import { configServiceFactory } from '../config/service';
import { loggerServiceFactory } from '../logger/service';
import { stateServiceFactory, EMPTY_STATE } from '../state/service';
import { timeServiceFactory } from '../time/service';

import * as testedModule from './service';

tape('OpenAPI Backend', (test: tape.Test) => {
  test.plan(2);
  class MockBackEndEngine {
    constructor() {
      return this;
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
  const stateService = stateServiceFactory({ loggerService })(EMPTY_STATE);
  testedModule
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
