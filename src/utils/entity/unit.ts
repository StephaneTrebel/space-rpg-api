import tape from 'tape';

import { createPlayer } from '../player/utils';

import { EntityType } from './types';

import * as testedModule from './utils';

tape('Entity utils', (functions: tape.Test) => {
  functions.test('createEntity()', (cases: tape.Test) => {
    cases.test(
      'WHEN called with a Mock entity parameters',
      (test: tape.Test) => {
        test.plan(1);
        test.deepEqual(
          testedModule.createEntity(EntityType.MOCK)({
            currentPosition: { x: 1, y: 2, z: 3 },
            id: 'myNewMockEntity',
            name: 'mock',
          }),
          {
            currentPosition: { x: 1, y: 2, z: 3 },
            id: 'myNewMockEntity',
            name: 'mock',
            type: EntityType.MOCK,
          },
          'SHOULD return a new Mock Entity',
        );
        test.end();
      },
    );

    cases.test('WHEN called without an id parameter', (test: tape.Test) => {
      test.plan(1);
      const result = testedModule.createEntity(EntityType.MOCK)({});
      test.deepEqual(
        typeof result.id,
        'string',
        'SHOULD return an entity with a string id',
      );
      test.end();
    });

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
            name: 'toto',
          }),
          {
            currentPosition: { x: 1, y: 2, z: 3 },
            id: 'myNewPlayerEntity',
            name: 'toto',
            type: EntityType.PLAYER,
          },
          'SHOULD return a new Player Entity',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN called with a Spaceship entity parameters',
      (test: tape.Test) => {
        test.plan(1);
        const player = createPlayer({});
        test.deepEqual(
          testedModule.createEntity(EntityType.SPACESHIP)({
            currentPosition: { x: 1, y: 2, z: 3 },
            fuel: 123,
            id: 'myNewSpaceshipEntity',
            name: 'toto',
            onBoard: [player],
          }),
          {
            currentPosition: { x: 1, y: 2, z: 3 },
            fuel: 123,
            id: 'myNewSpaceshipEntity',
            name: 'toto',
            onBoard: [player],
            type: EntityType.SPACESHIP,
          },
          'SHOULD return a new Spaceship Entity',
        );
        test.end();
      },
    );
  });
});
