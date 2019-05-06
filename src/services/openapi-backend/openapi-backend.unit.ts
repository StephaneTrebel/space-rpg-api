import tape from 'tape';
import * as testedModule from './openapi-backend';

tape('OpenAPI Backend', (test: tape.Test) => {
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
  });
});
