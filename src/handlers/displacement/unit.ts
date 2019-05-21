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
        const stateService = stateServiceFactory({
          ...EMPTY_STATE,
          playerList: [],
        });
        const timeService = timeServiceFactory({
          configService,
          loggerService,
          stateService,
        })();
        timeService.addAction(displacement);
        test.throws(
          () =>
            testedModule.getDisplacementFromTimeService({
              id: 'qux',
              timeService,
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
        const stateService = stateServiceFactory({
          ...EMPTY_STATE,
          playerList: [],
        });
        const timeService = timeServiceFactory({
          configService,
          loggerService,
          stateService,
        })();
        timeService.addAction(
          createBaseActionMock({
            ...MOCK_BASE_ACTION,
            id,
          }),
        );
        test.throws(
          () =>
            testedModule.getDisplacementFromTimeService({
              id,
              timeService,
            }),
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
        const timeService = timeServiceFactory({
          configService: configServiceFactory(),
          loggerService: loggerServiceFactory(),
          stateService: stateServiceFactory(EMPTY_STATE),
        })();
        timeService.addAction(displacement);
        test.equal(
          testedModule.getDisplacementFromTimeService({
            id,
            timeService,
          }),
          displacement,
          'SHOULD return the displacement',
        );
        test.end();
      },
    );
  });

  functions.test('getDisplacement()', (cases: tape.Test) => {
    cases.test(
      'WHEN given an entity and a TimeService having this entity',
      (test: tape.Test) => {
        test.plan(3);
        const id: Id = 'getDisplacement';
        const displacement: Displacement = testedModule.createDisplacementMock({
          ...testedModule.MOCK_DISPLACEMENT,
          id,
        });
        const configService = configServiceFactory();
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory(EMPTY_STATE);
        const timeService = timeServiceFactory({
          configService,
          loggerService,
          stateService,
        })();
        timeService.addAction(displacement);
        testedModule.getDisplacement({
          timeService,
        })(
          { request: { params: { id } } } as any,
          {} as any,
          {
            status: (returnedStatus: number) => ({
              json: (returnedJSON: {
                links: LinkList;
                displacementId: string;
              }) => {
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
