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
import { createPlanet } from '../../../utils/planet/utils';
import * as testedModule from './handler';

tape('Displacement TravelToPosition handler', (functionTest: tape.Test) => {
  functionTest.test('travelToPosition()', (when: tape.Test) => {
    when.test(
      'WHEN given an entity and a State lacking this entity',
      (test: tape.Test) => {
        test.plan(3);
        const testId: Id = 'travelToPositionFailure';
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
        })();
        const handlerResponse = testedModule.travelToPosition({
          loggerService,
          stateService,
          testId,
          timeService,
        })({ request: { requestBody: { entityId: testId } } } as any);
        test.equal(
          handlerResponse.status,
          400,
          'SHOULD sucessfully return a 400 response',
        );
        test.equal(
          typeof handlerResponse.json.code,
          'string',
          'SHOULD sucessfully return a body having a code property',
        );
        test.equal(
          typeof handlerResponse.json.message,
          'string',
          'SHOULD sucessfully return a body having a message property',
        );
        test.end();
      },
    );

    when.test(
      'WHEN given an entity and a State having this entity',
      (test: tape.Test) => {
        test.plan(3);
        const testId: Id = 'travelToPosition';
        const entity = createPlanet({
          currentPosition: {
            x: 271,
            y: 923,
            z: 391,
          },
          id: testId,
        });
        const configService = configServiceFactory({ ...DEFAULT_CONFIG });
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })({
          ...EMPTY_STATE,
          entityList: [entity],
        });
        const timeService = timeServiceFactory({
          configService,
          loggerService,
          stateService,
        })();
        const handlerResponse = testedModule.travelToPosition({
          loggerService,
          stateService,
          testId,
          timeService,
        })({
          request: {
            requestBody: {
              entityId: testId,
              targetCoordinates: { x: 0, y: 1, z: 2 },
            },
          },
        } as any);
        test.equal(
          handlerResponse.status,
          201,
          'SHOULD sucessfully return a 201 response',
        );
        test.equal(
          typeof handlerResponse.json.displacementId,
          'string',
          'SHOULD sucessfully return a body having a displacementId property',
        );
        test.deepEqual(
          handlerResponse.json.links,
          [
            {
              href: `/displacement/${testId}`,
              rel: 'details',
            },
          ],
          'SHOULD sucessfully return a body having a link to /displacement endpoint',
        );
        test.end();
      },
    );
  });
});
