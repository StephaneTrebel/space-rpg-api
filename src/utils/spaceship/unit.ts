import tape from 'tape';

import { loggerServiceFactory } from '../../services/logger/service';
import { EMPTY_STATE, stateServiceFactory } from '../../services/state/service';

import { Id } from '../id/types';

import { Spaceship } from './types';

import * as testedModule from './utils';
import { EntityType } from '../entity/types';

tape('Spaceship utils', (functions: tape.Test) => {
  functions.test('createSpaceship()', (cases: tape.Test) => {
    cases.test(
      'WHEN called without parameters besides id',
      (test: tape.Test) => {
        test.plan(1);
        test.deepEqual(
          testedModule.createSpaceship({ id: 'mockSpaceship' }),
          {
            currentPosition: { x: 0, y: 0, z: 0 },
            fuel: 1000,
            id: 'mockSpaceship',
            name: 'unknown',
            type: EntityType.SPACESHIP,
          },
          'SHOULD return a Spaceship with mock values',
        );
        test.end();
      },
    );

    cases.test('WHEN called with parameters', (test: tape.Test) => {
      test.plan(1);
      test.deepEqual(
        testedModule.createSpaceship({
          currentPosition: { x: 1, y: 2, z: 3 },
          fuel: 123,
          id: 'mySpaceshipId',
          name: 'toto',
        }),
        {
          currentPosition: { x: 1, y: 2, z: 3 },
          fuel: 123,
          id: 'mySpaceshipId',
          name: 'toto',
          type: EntityType.SPACESHIP,
        },
        'SHOULD return a Spaceship with passed values',
      );
      test.end();
    });
  });

  functions.test('createSpaceshipMutator()', (cases: tape.Test) => {
    cases.test(
      'WHEN called with a state AND a newSpaceship',
      (test: tape.Test) => {
        test.plan(1);
        const newSpaceship: Spaceship = testedModule.createSpaceship({
          currentPosition: { x: 2, y: 3, z: 4 },
          fuel: 123,
          id: 'bar',
          name: 'foo',
        });
        test.deepEqual(
          testedModule.createSpaceshipMutator(EMPTY_STATE)(newSpaceship),
          {
            ...EMPTY_STATE,
            entityList: [newSpaceship],
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
        const spaceship: Spaceship = testedModule.createSpaceship({
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
        const spaceship: Spaceship = testedModule.createSpaceship({
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
});
