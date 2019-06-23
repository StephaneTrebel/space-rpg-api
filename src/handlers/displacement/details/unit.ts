import tape from 'tape';

import {
  configServiceFactory,
  DEFAULT_CONFIG,
} from '../../../services/config/service';
import { loggerServiceFactory } from '../../../services/logger/service';
import {
  stateServiceFactory,
  EMPTY_STATE,
} from '../../../services/state/service';
import { timeServiceFactory } from '../../../services/time/service';

import { Id } from '../../../utils/id/types';
import { Displacement } from '../../../utils/displacememt/types';
import { createDisplacementMock } from '../../../utils/displacememt/utils';

import * as testedModule from './handler';

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

  functions.test('getDisplacementFromTimeService()', (cases: tape.Test) => {
    cases.test(
      'WHEN given an displacement id and a TimeService lacking this displacement',
      (test: tape.Test) => {
        test.plan(1);
        const id: Id = 'bar';
        const displacement: Displacement = createDisplacementMock({
          id,
        });
        const configService = configServiceFactory({ ...DEFAULT_CONFIG });
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
      'WHEN given an displacement id and a TimeService having this displacement',
      (test: tape.Test) => {
        test.plan(1);
        const id: Id = 'bar';
        const displacement: Displacement = createDisplacementMock({
          id,
        });
        const loggerService = loggerServiceFactory();
        const timeService = timeServiceFactory({
          configService: configServiceFactory({ ...DEFAULT_CONFIG }),
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
        const configService = configServiceFactory({ ...DEFAULT_CONFIG });
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })(
          EMPTY_STATE,
        );
        const timeService = timeServiceFactory({
          configService,
          loggerService,
          stateService,
        })();
        const handlerResponse = testedModule.getDisplacement({
          loggerService,
          timeService,
        })({ request: { params: { id } } } as any);
        test.equal(handlerResponse.status, 400, 'SHOULD return a 400 response');
        test.equal(
          typeof handlerResponse.json.code,
          'string',
          'SHOULD return a body having a string code property',
        );
        test.equal(
          typeof handlerResponse.json.message,
          'string',
          'SHOULD return a body having a string message property',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN given an displacement and a TimeService having this displacement',
      (test: tape.Test) => {
        test.plan(3);
        const id: Id = 'getDisplacement';
        const displacement: Displacement = createDisplacementMock({
          id,
        });
        const configService = configServiceFactory({ ...DEFAULT_CONFIG });
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })(
          EMPTY_STATE,
        );
        const timeService = timeServiceFactory({
          configService,
          loggerService,
          stateService,
        })([displacement]);
        const handlerResponse = testedModule.getDisplacement({
          loggerService,
          timeService,
        })({ request: { params: { id } } } as any);
        test.equal(handlerResponse.status, 200, 'SHOULD return a 200 response');
        test.deepEqual(
          handlerResponse.json.displacement,
          displacement,
          'SHOULD return a body having a displacement object',
        );
        test.deepEqual(
          handlerResponse.json.links,
          [],
          'SHOULD return a body having an empty link list',
        );
        test.end();
      },
    );
  });
});
