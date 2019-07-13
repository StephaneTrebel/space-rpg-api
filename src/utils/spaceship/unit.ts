import tape from 'tape';

import { loggerServiceFactory } from '../../services/logger/service';
import { EMPTY_STATE, stateServiceFactory } from '../../services/state/service';

import { Id } from '../id/types';
import { PlayerCarryingEntity } from '../player/types';
import { createPlayer } from '../player/utils';

import * as testedModule from './utils';
import { EntityType } from '../entity/types';

tape('Spaceship utils', (functions: tape.Test) => {
  functions.test('createSpaceship()', (cases: tape.Test) => {
    cases.test('WHEN called without parameters', (test: tape.Test) => {
      test.plan(1);
      const newSpaceship = testedModule.createSpaceship({});
      test.deepEqual(
        newSpaceship,
        {
          currentPosition: {
            x: 0,
            y: 0,
            z: 0,
          },
          fuel: 1000,
          id: newSpaceship.id,
          name: 'unknown',
          onBoard: [],
          type: EntityType.SPACESHIP,
        },
        'SHOULD return a Spaceship with mocked values',
      );
    });

    cases.test('WHEN called with parameters', (test: tape.Test) => {
      test.plan(1);
      test.deepEqual(
        testedModule.createSpaceship({
          currentPosition: {
            x: 1,
            y: 2,
            z: 3,
          },
          id: 'foo',
          name: 'bar',
        }),
        {
          currentPosition: {
            x: 1,
            y: 2,
            z: 3,
          },
          fuel: 1000,
          id: 'foo',
          name: 'bar',
          onBoard: [],
          type: EntityType.SPACESHIP,
        },
        'SHOULD return a Spaceship with specified values',
      );
    });
  });

  functions.test('createSpaceshipMutator()', (cases: tape.Test) => {
    cases.test(
      'WHEN called with a state AND a spaceship',
      (test: tape.Test) => {
        test.plan(1);
        const spaceship = testedModule.createSpaceship({
          currentPosition: { x: 2, y: 3, z: 4 },
          fuel: 123,
          id: 'bar',
          name: 'foo',
        });
        test.deepEqual(
          testedModule.createSpaceshipMutator(EMPTY_STATE)(spaceship),
          {
            ...EMPTY_STATE,
            entityList: [spaceship],
          },
          'SHOULD return a state having this new spaceship',
        );
        test.end();
      },
    );
  });

  functions.test('getSpaceshipFromStateService()', (cases: tape.Test) => {
    cases.test(
      'WHEN given an spaceship id and a StateService lacking this spaceship',
      (test: tape.Test) => {
        test.plan(1);
        const id: Id = 'bar';
        const spaceship = testedModule.createSpaceship({
          id,
        });
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })({
          ...EMPTY_STATE,
          entityList: [spaceship],
        });
        test.throws(
          () =>
            testedModule.getSpaceshipFromStateService({
              loggerService,
              stateService,
            })({
              id: 'qux',
            }),
          'SHOULD throw an error',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN given an spaceship id and a StateService having this spaceship',
      (test: tape.Test) => {
        test.plan(1);
        const id: Id = 'bar';
        const spaceship = testedModule.createSpaceship({
          id,
        });
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })({
          ...EMPTY_STATE,
          entityList: [spaceship],
        });
        test.equal(
          testedModule.getSpaceshipFromStateService({
            loggerService,
            stateService,
          })({ id }),
          spaceship,
          'SHOULD return the spaceship details',
        );
        test.end();
      },
    );
  });

  functions.test('hasBoarded()', (cases: tape.Test) => {
    cases.test(
      'WHEN called with a spaceship and an entity not already on this spaceship',
      (test: tape.Test) => {
        test.plan(1);
        const player = createPlayer({});
        const spaceship = testedModule.createSpaceship({
          onBoard: [],
        });
        test.equal(
          testedModule.hasBoarded(spaceship)(player),
          false,
          'SHOULD return false',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN called with a spaceship and an player already on this spaceship',
      (test: tape.Test) => {
        test.plan(1);
        const player = createPlayer({ id: 'foo' });
        const spaceship = testedModule.createSpaceship({
          onBoard: [player],
        });
        test.deepEqual(
          testedModule.hasBoarded(spaceship)(player),
          true,
          'SHOULD return true',
        );
        test.end();
      },
    );
  });

  functions.test('boardSpaceship()', (cases: tape.Test) => {
    cases.test(
      'WHEN called with a spaceship and an player already in this spaceship',
      (test: tape.Test) => {
        test.plan(1);
        const player = createPlayer({ id: 'foo' });
        const spaceship = testedModule.createSpaceship({
          onBoard: [player],
        });
        test.throws(
          () => testedModule.boardSpaceship(spaceship)(player),
          'SHOULD throw an error',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN called with a spaceship and an player not already in this spaceship',
      (test: tape.Test) => {
        test.plan(3);
        const playerA = createPlayer({ id: 'foo' });
        const playerB = createPlayer({ id: 'bar' });
        const playerC = createPlayer({ id: 'qux' });
        const spaceship = testedModule.createSpaceship({
          onBoard: [playerA, playerB],
        });
        const couple = testedModule.boardSpaceship(spaceship)(playerC);
        test.deepEqual(
          couple.spaceship.onBoard,
          [playerA, playerB, playerC],
          'SHOULD return an object having a spaceship property that has the player added to its onboard list',
        );
        test.equal(
          couple.entity.id,
          playerC.id,
          'SHOULD return an object having an entity property that has the same id as the player',
        );
        test.equal(
          (couple.entity.boardedIn as PlayerCarryingEntity).id,
          spaceship.id,
          'SHOULD return an object having an entity property that is boarded in the spaceship',
        );
        test.end();
      },
    );
  });
});
