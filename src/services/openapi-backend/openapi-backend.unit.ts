import tape from 'tape';

import { loggerServiceFactory } from '../logger/logger';
import { stateServiceFactory, EMPTY_STATE } from '../state/state';
import { timeServiceFactory } from "../time/time";

import * as testedModule from './openapi-backend';

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

  testedModule.spawnAPIBackend({
    backendEngine: MockBackEndEngine,
    loggerService: loggerServiceFactory({ nolog: true }),
    stateService: stateServiceFactory(EMPTY_STATE),
    timeService: timeServiceFactory(),
  });
});
