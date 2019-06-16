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
import { MOCK_PLAYER, createPlayer } from '../../../utils/player/utils';
import { Position } from '../../../utils/position/types';

import * as testedModule from './handler';

tape('Displacement handler', (functionTest: tape.Test) => {
  functionTest.test('travelToPosition()', (when: tape.Test) => {
    when.test(
      'WHEN given an entity and a State having this entity',
      (test: tape.Test) => {
        test.plan(3);
        const testId: Id = 'travelToPosition';
        const currentPosition: Position = {
          x: 271,
          y: 923,
          z: 391,
        };
        const entity = createPlayer({
          ...MOCK_PLAYER,
          currentPosition,
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
          testId,
          timeService,
        })({ request: { requestBody: { entityId: testId } } } as any);
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
