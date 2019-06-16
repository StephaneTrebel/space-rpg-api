import tape from 'tape';

import { Id } from '../../../utils/id/types';

import { loggerServiceFactory } from '../../../services/logger/service';
import {
  stateServiceFactory,
  EMPTY_STATE,
} from '../../../services/state/service';

import * as testedModule from './handler';
import { MOCK_PLAYER, createPlayer } from '../../../utils/player/utils';

tape('Player handler', (functions: tape.Test) => {
  functions.test('getPlayerDetails()', (cases: tape.Test) => {
    cases.test(
      'WHEN given an player and a StateService lacking this player',
      (test: tape.Test) => {
        test.plan(3);
        const id: Id = 'getPlayerDetailsFailure';
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })(
          EMPTY_STATE,
        );
        const handlerResponse = testedModule.getPlayerDetails({
          loggerService,
          stateService,
        })({ request: { params: { id } } } as any);
        test.equal(
          handlerResponse.status,
          400,
          'SHOULD sucessfully return a 400 response',
        );
        test.equal(
          typeof handlerResponse.json.code,
          'string',
          'SHOULD sucessfully return a body having a string code property',
        );
        test.equal(
          typeof handlerResponse.json.message,
          'string',
          'SHOULD sucessfully return a body having a string message property',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN given an player and a StateService having this player',
      (test: tape.Test) => {
        test.plan(3);
        const id: Id = 'getPlayer';
        const player = createPlayer({
          ...MOCK_PLAYER,
          id,
        });
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })({
          ...EMPTY_STATE,
          entityList: [player],
        });
        const handlerResponse = testedModule.getPlayerDetails({
          loggerService,
          stateService,
        })({ request: { params: { id } } } as any);
        test.equal(
          handlerResponse.status,
          200,
          'SHOULD sucessfully return a 200 response',
        );
        test.deepEqual(
          handlerResponse.json.player,
          player,
          'SHOULD sucessfully return a body having a player object',
        );
        test.deepEqual(
          handlerResponse.json.links,
          [],
          'SHOULD sucessfully return a body having an empty link list',
        );
        test.end();
      },
    );
  });
});
