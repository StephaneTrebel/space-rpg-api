import tape from 'tape';

import { Id } from '../../types/id';

import { configServiceFactory } from '../../services/config/service';
import { loggerServiceFactory } from '../../services/logger/service';
import { stateServiceFactory, EMPTY_STATE } from '../../services/state/service';
import {
  timeServiceFactory,
  createBaseActionMock,
  MOCK_BASE_ACTION,
} from '../../services/time/service';

import * as testedModule from './handler';
import { Displacement } from './types';
import { LinkList } from '../../services/webserver/service';

tape('Displacement handler', (functions: tape.Test) => {
  functions.test('getDisplacementIdFromContext()', (cases: tape.Test) => {
    cases.test('WHEN given a Context object', (test: tape.Test) => {
      test.plan(1);
      const id: Id = 'lel';
      const context: any = {
        request: { params: { id } },
      };
      test.equal(
        testedModule.getDisplacementIdFromContext(context),
        id,
        'SHOULD return the Context id property',
      );
      test.end();
    });
  });

  functions.test('createDisplacementMock()', (cases: tape.Test) => {
    cases.test('WHEN given no parameters', (test: tape.Test) => {
      test.plan(2);
      const displacement = testedModule.createDisplacementMock();
      test.deepEqual(
        displacement,
        testedModule.MOCK_DISPLACEMENT,
        'SHOULD return a Displacement mock object',
      );
      return displacement.executor({} as any).then(() => {
        test.pass(
          'this Displacement mock object executor method should return a Promise',
        );
        test.end();
      });
    });
  });

  functions.test('getDisplacementFromTimeService()', (cases: tape.Test) => {
    cases.test(
      'WHEN given an displacement id and a TimeService lacking this displacement',
      (test: tape.Test) => {
        test.plan(1);
        const id: Id = 'bar';
        const displacement: Displacement = testedModule.createDisplacementMock({
          ...testedModule.MOCK_DISPLACEMENT,
          id,
        });
        const configService = configServiceFactory();
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })({
          ...EMPTY_STATE,
          entityList: [],
        });
        const timeService = timeServiceFactory({
          configService,
          loggerService,
          stateService,
        })([displacement]);
        test.throws(
          () =>
            testedModule.getDisplacementFromTimeService({
              loggerService,
              timeService,
            })({
              id: 'qux',
            }),
          'SHOULD throw an error',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN given an displacement id and a TimeService having a non-displacement action with the same id',
      (test: tape.Test) => {
        test.plan(1);
        const id: Id = 'bar';
        const configService = configServiceFactory();
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })({
          ...EMPTY_STATE,
          entityList: [],
        });
        const timeService = timeServiceFactory({
          configService,
          loggerService,
          stateService,
        })([
          createBaseActionMock({
            ...MOCK_BASE_ACTION,
            id,
          }),
        ]);
        test.throws(
          () =>
            testedModule.getDisplacementFromTimeService({
              loggerService,
              timeService,
            })({ id }),
          'SHOULD throw an error',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN given an displacement id and a TimeService having this displacement',
      (test: tape.Test) => {
        test.plan(1);
        const id: Id = 'bar';
        const displacement: Displacement = testedModule.createDisplacementMock({
          ...testedModule.MOCK_DISPLACEMENT,
          id,
        });
        const loggerService = loggerServiceFactory();
        const timeService = timeServiceFactory({
          configService: configServiceFactory(),
          loggerService: loggerServiceFactory(),
          stateService: stateServiceFactory({ loggerService })(EMPTY_STATE),
        })([displacement]);
        test.equal(
          testedModule.getDisplacementFromTimeService({
            loggerService,
            timeService,
          })({ id }),
          displacement,
          'SHOULD return the displacement',
        );
        test.end();
      },
    );
  });

  functions.test('getDisplacement()', (cases: tape.Test) => {
    cases.test(
      'WHEN given an displacement and a TimeService lacking this displacement',
      (test: tape.Test) => {
        test.plan(3);
        const id: Id = 'getDisplacement';
        const configService = configServiceFactory();
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })(EMPTY_STATE);
        const timeService = timeServiceFactory({
          configService,
          loggerService,
          stateService,
        })();
        testedModule.getDisplacement({
          loggerService,
          timeService,
        })(
          { request: { params: { id } } } as any,
          {} as any,
          {
            status: (returnedStatus: number) => ({
              json: (returnedJSON: { code: string; message: string }) => {
                test.equal(
                  returnedStatus,
                  400,
                  'SHOULD sucessfully return a 400 response',
                );
                test.equal(
                  typeof returnedJSON.code,
                  'string',
                  'SHOULD sucessfully return a body having a string code property',
                );
                test.equal(
                  typeof returnedJSON.message,
                  'string',
                  'SHOULD sucessfully return a body having a string message property',
                );
                test.end();
              },
            }),
          } as any,
        );
      },
    );

    cases.test(
      'WHEN given an displacement and a TimeService having this displacement',
      (test: tape.Test) => {
        test.plan(3);
        const id: Id = 'getDisplacement';
        const displacement: Displacement = testedModule.createDisplacementMock({
          ...testedModule.MOCK_DISPLACEMENT,
          id,
        });
        const configService = configServiceFactory();
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })(EMPTY_STATE);
        const timeService = timeServiceFactory({
          configService,
          loggerService,
          stateService,
        })([displacement]);
        testedModule.getDisplacement({
          loggerService,
          timeService,
        })(
          { request: { params: { id } } } as any,
          {} as any,
          {
            status: (returnedStatus: number) => ({
              json: (returnedJSON: { links: LinkList }) => {
                test.equal(
                  returnedStatus,
                  200,
                  'SHOULD sucessfully return a 200 response',
                );
                test.deepEqual(
                  returnedJSON,
                  { ...displacement, links: [] },
                  'SHOULD sucessfully return a body having a displacement object',
                );
                test.deepEqual(
                  returnedJSON.links,
                  [],
                  'SHOULD sucessfully return a body having an empty link list',
                );
                test.end();
              },
            }),
          } as any,
        );
      },
    );
  });
});
