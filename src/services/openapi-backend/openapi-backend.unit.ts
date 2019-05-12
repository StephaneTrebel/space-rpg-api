import tape from 'tape';

import { EMPTY_UNIVERSE } from '../../assets/universe';

import { loggerServiceFactory } from '../logger/logger';
import { stateServiceFactory } from '../state/state';

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
    stateService: stateServiceFactory(),
    universe: EMPTY_UNIVERSE,
  });
});
