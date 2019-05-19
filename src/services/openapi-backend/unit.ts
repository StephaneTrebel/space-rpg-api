import tape from 'tape';

import { configServiceFactory } from '../config/service';
import { loggerServiceFactory } from '../logger/service';
import { stateServiceFactory, EMPTY_STATE } from '../state/service';
import { timeServiceFactory } from '../time/service';

import * as testedModule from './service';

tape('OpenAPI Backend', (test: tape.Test) => {
  test.plan(1);
  class MockBackEndEngine {
    constructor() {
      return this;
    }

    public init() {
      test.pass('spawnAPIBackend SHOULD initialize the OpenAPI Backend');
      test.end();
    }
  }

  const stateService = stateServiceFactory(EMPTY_STATE);
  testedModule.spawnAPIBackend({
    backendEngine: MockBackEndEngine,
    loggerService: loggerServiceFactory(),
    stateService,
    timeService: timeServiceFactory({
      configService: configServiceFactory(),
      loggerService: loggerServiceFactory(),
      stateService,
    }),
  });
});
