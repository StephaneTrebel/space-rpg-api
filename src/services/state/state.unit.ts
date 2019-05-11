import tape from 'tape';

import { Player } from '../../handlers/player/player.types';

import * as testedModule from './state';

tape('State Service', (functionTest: tape.Test) => {
  functionTest.test('get()', (test: tape.Test) => {
    test.plan(1);
    const MOCK_PLAYER_LIST: Array<Player> = [{ username: 'foo' }];
    test.deepEqual(
      testedModule
        .stateServiceFactory({ playerList: MOCK_PLAYER_LIST })
        .get(testedModule.StateProperties.PLAYER_LIST),
      MOCK_PLAYER_LIST,
      'get() SHOULD retrieve playerList from a State',
    );
    test.end();
  });
  functionTest.test('mutate()', (cases: tape.Test) => {
    cases.test(
      'WHEN called with a CREATE_PLAYER mutation',
      (test: tape.Test) => {
        test.plan(1);
        test.deepEqual(
          testedModule
            .stateServiceFactory()
            .mutate(testedModule.StateMutation.CREATE_PLAYER)({
            username: 'foo',
          }),
          { playerList: [{ username: 'foo' }] },
          'mutate() SHOULD return a mutated state',
        );
        test.end();
      },
    );
  });
});
