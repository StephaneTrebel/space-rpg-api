import tape from 'tape';

import { EntityType } from './types';

import * as testedModule from './utils';

tape('Entity utils', (functions: tape.Test) => {
  functions.test('createEntity()', (cases: tape.Test) => {
    cases.test('WHEN called with an unknown type', (test: tape.Test) => {
      test.plan(1);
      test.throws(
        () => testedModule.createEntity('foo' as any),
        'SHOULD throw an error',
      );
      test.end();
    });

    cases.test(
      'WHEN called with a NONE entity parameters',
      (test: tape.Test) => {
        test.plan(1);
        test.throws(
          () =>
            testedModule.createEntity({
              currentPosition: { x: 1, y: 2, z: 3 },
              id: 'myNewNoneEntity',
              type: EntityType.NONE,
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
          testedModule.createEntity({
            currentPosition: { x: 1, y: 2, z: 3 },
            id: 'myNewMockEntity',
            type: EntityType.MOCK,
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
      'WHEN called with a Player entity parameters',
      (test: tape.Test) => {
        test.plan(1);
        test.deepEqual(
          testedModule.createEntity({
            currentPosition: { x: 1, y: 2, z: 3 },
            id: 'myNewPlayerEntity',
            type: EntityType.PLAYER,
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
