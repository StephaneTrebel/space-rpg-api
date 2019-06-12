import tape from 'tape';

import { configServiceFactory } from '../config/service';
import { loggerServiceFactory } from '../logger/service';
import { stateServiceFactory, EMPTY_STATE } from '../state/service';
import { timeServiceFactory } from '../time/service';

import { HandlerResponse } from './types';

import * as testedModule from './service';

tape('OpenAPI Backend', (functions: tape.Test) => {
  functions.test('postResponseHandler()', (given: tape.Test) => {
    given.test('GIVEN a lack of context', (when: tape.Test) => {
      when.test('WHEN called without a context', (test: tape.Test) => {
        test.plan(3);
        return testedModule.postResponseHandler({
          loggerService: loggerServiceFactory(),
        })(
          undefined as any, // context
          undefined as any, // request
          {
            status: (httpCode: number) => {
              test.equal(httpCode, 500, 'SHOULD return a 500 response');
              return {
                json: (body: any) => {
                  test.equal(
                    typeof body.code,
                    'string',
                    'SHOULD return a body having a string code property',
                  );
                  test.equal(
                    typeof body.message,
                    'string',
                    'SHOULD return a body having a string message property',
                  );
                  test.end();
                },
              };
            },
          } as any,
        );
      });
    });

    given.test(
      'GIVEN a context where the request is invalid',
      (when: tape.Test) => {
        when.test('WHEN called', (test: tape.Test) => {
          test.plan(1);
          test.equal(
            testedModule.postResponseHandler({
              loggerService: loggerServiceFactory(),
            })(
              { validation: { valid: false } } as any, // context
              undefined as any, // request
              undefined as any, // response
            ),
            undefined,
            'SHOULD return undefined',
          );
          test.end();
        });
      },
    );

    given.test('GIVEN a valid context', (when: tape.Test) => {
      when.test('WHEN called with an invalid response', (test: tape.Test) => {
        const mockResponse: HandlerResponse = {
          json: { foo: 'bar' },
          status: 123,
        };
        const errors = [{ bar: 'foo' }];
        test.plan(3);
        return testedModule.postResponseHandler({
          loggerService: loggerServiceFactory(),
        })(
          {
            api: {
              validateResponse: () => ({
                errors,
                valid: false,
              }),
            },
            response: mockResponse,
            validation: { valid: true },
          } as any,
          undefined as any, // request
          {
            status: (httpCode: number) => {
              test.equal(httpCode, 502, 'SHOULD return a 502 response');
              return {
                json: (body: any) => {
                  test.equal(
                    typeof body.code,
                    'string',
                    'SHOULD return a body having a string code property',
                  );
                  test.deepEqual(
                    body.errors,
                    errors,
                    'SHOULD return a body having a list of all errors',
                  );
                  test.end();
                },
              };
            },
          } as any,
        );
      });

      when.test('WHEN called with an valid response', (test: tape.Test) => {
        const mockResponse: HandlerResponse = {
          json: { foo: 'bar' },
          status: 123,
        };
        test.plan(2);
        return testedModule.postResponseHandler({
          loggerService: loggerServiceFactory(),
        })(
          {
            api: {
              validateResponse: () => ({
                valid: true,
              }),
            },
            response: mockResponse,
            validation: { valid: true },
          } as any,
          undefined as any, // request
          {
            status: (httpCode: number) => {
              test.equal(
                httpCode,
                mockResponse.status,
                'SHOULD return a response having the context response status',
              );
              return {
                json: (body: any) => {
                  test.deepEqual(
                    body,
                    mockResponse.json,
                    'SHOULD return a body having the context response json content',
                  );
                  test.end();
                },
              };
            },
          } as any,
        );
      });
    });
  });

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
