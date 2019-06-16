import tape from 'tape';

import { EntityType } from './types';

import * as testedModule from './utils';

tape('Entity utils', (functions: tape.Test) => {
  functions.test('createEntity()', (cases: tape.Test) => {
    cases.test(
      'WHEN called with a NONE entity parameters',
      (test: tape.Test) => {
        test.plan(1);
        test.throws(
          () =>
            testedModule.createEntity(EntityType.NONE)({
              currentPosition: { x: 1, y: 2, z: 3 },
              id: 'myNewNoneEntity',
            }),
          'SHOULD throw an error',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN called with a Mock entity parameters',
      (test: tape.Test) => {
        test.plan(1);
        test.deepEqual(
          testedModule.createEntity(EntityType.MOCK)({
            currentPosition: { x: 1, y: 2, z: 3 },
            id: 'myNewMockEntity',
          }),
          {
            currentPosition: { x: 1, y: 2, z: 3 },
            id: 'myNewMockEntity',
            type: EntityType.MOCK,
          },
          'SHOULD return a new Mock Entity',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN called with a Planet entity parameters',
      (test: tape.Test) => {
        test.plan(1);
        test.deepEqual(
          testedModule.createEntity(EntityType.PLANET)({
            currentPosition: { x: 1, y: 2, z: 3 },
            id: 'myNewPlanetEntity',
            name: 'toto',
          }),
          {
            currentPosition: { x: 1, y: 2, z: 3 },
            id: 'myNewPlanetEntity',
            name: 'toto',
            type: EntityType.PLANET,
          },
          'SHOULD return a new Planet Entity',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN called with a Player entity parameters',
      (test: tape.Test) => {
        test.plan(1);
        test.deepEqual(
          testedModule.createEntity(EntityType.PLAYER)({
            currentPosition: { x: 1, y: 2, z: 3 },
            id: 'myNewPlayerEntity',
            username: 'toto',
          }),
          {
            currentPosition: { x: 1, y: 2, z: 3 },
            id: 'myNewPlayerEntity',
            type: EntityType.PLAYER,
            username: 'toto',
          },
          'SHOULD return a new Player Entity',
        );
        test.end();
      },
    );
  });
});
