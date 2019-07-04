import tape from 'tape';

import { loggerServiceFactory } from '../../../services/logger/service';
import {
  stateServiceFactory,
  EMPTY_STATE,
} from '../../../services/state/service';

import * as testedModule from './handler';

tape('Player creation handler', (functionTest: tape.Test) => {
  functionTest.test('addNewPlayer()', (test: tape.Test) => {
    const MOCK_NAME = Symbol('name');
    const loggerService = loggerServiceFactory();
    const handlerResponse = testedModule.addNewPlayer({
      loggerService: loggerServiceFactory(),
      stateService: stateServiceFactory({ loggerService })({
        ...EMPTY_STATE,
      }),
    })({
      request: { requestBody: { name: MOCK_NAME } },
    } as any);
    test.plan(5);
    test.equal(handlerResponse.status, 201, 'SHOULD return a 201 status');
    test.equal(
      typeof handlerResponse.json.player.id,
      'string',
      'SHOULD return a string id',
    );
    test.equal(
      handlerResponse.json.player.name,
      MOCK_NAME,
      'SHOULD return the expected name',
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
