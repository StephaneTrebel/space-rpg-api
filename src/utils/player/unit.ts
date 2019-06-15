import tape from 'tape';

import { EMPTY_STATE } from '../../services/state/service';

import { Player } from './types';

import * as testedModule from './utils';

tape('Player utils', (functionTest: tape.Test) => {
  functionTest.test('createPlayerMutator()', (cases: tape.Test) => {
    cases.test(
      'WHEN called with a state AND a newPlayer',
      (test: tape.Test) => {
        test.plan(1);
        const newPlayer: Player = {
          ...testedModule.MOCK_PLAYER,
          username: 'foo',
        };
        test.deepEqual(
          testedModule.createPlayerMutator(EMPTY_STATE)(newPlayer),
          {
            ...EMPTY_STATE,
            entityList: [{ ...testedModule.MOCK_PLAYER, username: 'foo' }],
          },
          'SHOULD return a state having this new player',
        );
        test.end();
      },
    );
  });
});
