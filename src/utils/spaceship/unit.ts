import tape from 'tape';

import { loggerServiceFactory } from '../../services/logger/service';
import { EMPTY_STATE, stateServiceFactory } from '../../services/state/service';

import { Id } from '../id/types';
import { createPlayer } from '../player/utils';

import * as testedModule from './utils';

tape('Spaceship utils', (functions: tape.Test) => {
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

  functions.test('boardSpaceship()', (cases: tape.Test) => {
    cases.test(
      'WHEN called with a spaceship and an player already in this spaceship',
      (test: tape.Test) => {
        test.plan(1);
        const player = createPlayer({ id: 'foo' });
        const spaceship = testedModule.createSpaceship({
          currentPosition: { x: 2, y: 3, z: 4 },
          fuel: 123,
          id: 'bar',
          name: 'foo',
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
        test.plan(1);
        const playerA = createPlayer({ id: 'foo' });
        const playerB = createPlayer({ id: 'bar' });
        const playerC = createPlayer({ id: 'qux' });
        const spaceship = testedModule.createSpaceship({
          currentPosition: { x: 2, y: 3, z: 4 },
          fuel: 123,
          id: 'bar',
          name: 'foo',
          onBoard: [playerA, playerB],
        });
        test.deepEqual(
          testedModule.boardSpaceship(spaceship)(playerC).onBoard,
          [playerA, playerB, playerC],
          'SHOULD return a spaceship with the player added to its onBoard property',
        );
        test.end();
      },
    );
  });
});
