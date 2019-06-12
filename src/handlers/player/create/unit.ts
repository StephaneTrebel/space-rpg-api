import tape from 'tape';

import { loggerServiceFactory } from '../../../services/logger/service';
import {
  stateServiceFactory,
  EMPTY_STATE,
} from '../../../services/state/service';

import { Player } from '../types';

import * as testedModule from './handler';

tape('Player creation handler', (functionTest: tape.Test) => {
  functionTest.test('createPlayer()', (test: tape.Test) => {
    test.plan(5);
    test.equal(
      typeof testedModule.createPlayer({
        ...testedModule.MOCK_PLAYER,
        id: undefined,
      }).id,
      'string',
      'createPlayer() SHOULD sucessfully return an object with a string id',
    );
    test.equal(
      typeof testedModule.createPlayer({ ...testedModule.MOCK_PLAYER })
        .username,
      'string',
      'createPlayer() SHOULD sucessfully return an object that has a username property',
    );
    test.equal(
      typeof testedModule.createPlayer({ ...testedModule.MOCK_PLAYER })
        .currentPosition.x,
      'number',
      'createPlayer() SHOULD sucessfully return an object that has a currentPosition.x property',
    );
    test.equal(
      typeof testedModule.createPlayer({ ...testedModule.MOCK_PLAYER })
        .currentPosition.y,
      'number',
      'createPlayer() SHOULD sucessfully return an object that has a currentPosition.y property',
    );
    test.equal(
      typeof testedModule.createPlayer({ ...testedModule.MOCK_PLAYER })
        .currentPosition.z,
      'number',
      'createPlayer() SHOULD sucessfully return an object that has a currentPosition.z property',
    );
    test.end();
  });

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

  functionTest.test('addNewPlayer()', (test: tape.Test) => {
    const MOCK_USERNAME = Symbol('username');
    const loggerService = loggerServiceFactory();
    const handlerResponse = testedModule.addNewPlayer({
      loggerService: loggerServiceFactory(),
      stateService: stateServiceFactory({ loggerService })({
        ...EMPTY_STATE,
      }),
    })({
      request: { requestBody: { username: MOCK_USERNAME } },
    } as any);
    test.plan(5);
    test.equal(handlerResponse.status, 201, 'SHOULD return a 201 status');
    test.equal(
      typeof handlerResponse.json.player.id,
      'string',
      'SHOULD return a string id',
    );
    test.equal(
      handlerResponse.json.player.username,
      MOCK_USERNAME,
      'SHOULD return the expected username',
    );
    test.deepEqual(
      handlerResponse.json.player.currentPosition,
      { x: 0, y: 0, z: 0 },
      'SHOULD return the expected position',
    );
    test.deepEqual(
      handlerResponse.json.links,
      [
        {
          href: '/self-health/ping',
          rel: 'ping',
        },
      ],
      'SHOULD return the expected links',
    );
    test.end();
  });
});
