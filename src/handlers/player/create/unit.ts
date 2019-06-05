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
    testedModule.addNewPlayer({
      stateService: stateServiceFactory({ loggerService })({ ...EMPTY_STATE }),
    })(
      { request: { requestBody: { username: MOCK_USERNAME } } } as any,
      '' as any,
      {
        status: (returnedStatus: number) => ({
          json: (returnedJSON: {
            links: Array<{ href: string; rel: string }>;
            username: string;
          }) => {
            test.plan(3);
            test.equal(
              returnedStatus,
              201,
              'SHOULD sucessfully return a 201 response',
            );
            test.equal(
              returnedJSON.username,
              MOCK_USERNAME,
              'SHOULD sucessfully return a body having a username property',
            );
            test.deepEqual(
              returnedJSON.links,
              [
                {
                  href: '/self-health/ping',
                  rel: 'ping',
                },
              ],
              'SHOULD sucessfully return a body having a link to Self-Health Ping endpoint',
            );
            test.end();
          },
        }),
      } as any,
    );
  });
});
