import tape from 'tape';

import { EMPTY_UNIVERSE } from '../../assets/universe';

import { Player } from '../../handlers/player/types';
import { createMockPlayer } from '../../handlers/player/create/handler';

import { StateProperties } from './types';

import * as testedModule from './service';

tape('State Service', (functionTest: tape.Test) => {
  functionTest.test('get()', (test: tape.Test) => {
    test.plan(1);
    const MOCK_PLAYER_LIST: Array<Player> = [createMockPlayer()];
    test.deepEqual(
      testedModule
        .stateServiceFactory({
          playerList: MOCK_PLAYER_LIST,
          universe: EMPTY_UNIVERSE,
        })
        .get(StateProperties.PLAYER_LIST),
      MOCK_PLAYER_LIST,
      'SHOULD retrieve playerList from a State',
    );
    test.end();
  });
});
