import tape from 'tape';

import {
  configServiceFactory,
  DEFAULT_CONFIG,
} from '../../services/config/service';
import { loggerServiceFactory } from '../../services/logger/service';
import { stateServiceFactory, EMPTY_STATE } from '../../services/state/service';
import { State } from '../../services/state/types';
import { timeServiceFactory } from '../../services/time/service';
import { ActionType } from '../../services/time/types';

import { Displacement } from '../displacememt/types';
import { Id } from '../id/types';
import { Player } from '../player/types';
import { MOCK_PLAYER } from '../player/utils';
import { Position } from '../position/types';

import * as testedModule from './utils';

tape('Displacement handler', (functions: tape.Test) => {
  functions.test('createDisplacementMock()', (cases: tape.Test) => {
    cases.test('WHEN given no parameters', (test: tape.Test) => {
      test.plan(4);
      const displacement = testedModule.createDisplacementMock({});
      test.equal(
        displacement.type,
        ActionType.DISPLACEMENT,
        'SHOULD return an object that is an action of type DISPLACEMENT',
      );
      test.equal(
        typeof displacement.id,
        'string',
        'SHOULD return an object that has an id',
      );
      test.equal(
        typeof displacement.executor,
        'function',
        'SHOULD return an object that has an executor function',
      );
      return displacement.executor({} as any).then(() => {
        test.pass(
          'SHOULD return an object which executor function returns a Promise',
        );
        test.end();
      });
    });
  });

  functions.test('createDisplacement()', (given: tape.Test) => {
    given.test('GIVEN an unknown entity', (when: tape.Test) => {
      when.test('WHEN called with this entity id', (test: tape.Test) => {
        test.plan(1);
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })({
          ...EMPTY_STATE,
          entityList: [],
        });
        const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
        test.throws(
          () =>
            testedModule.createDisplacement({
              loggerService,
              stateService,
            })({
              entityId: 'unknown',
              target: targetCoordinates,
            }),
          'SHOULD throw an error',
        );
        test.end();
      });
    });

    given.test(
      'GIVEN an entity that is located at its target coordinates',
      (when: tape.Test) => {
        when.test(
          'WHEN called with this entity id and target coordinates',
          (test: tape.Test) => {
            test.plan(3);
            const entityId: Id = 'foo';
            const currentPosition: Position = { x: 0, y: 0, z: 0 };
            const configService = configServiceFactory({ ...DEFAULT_CONFIG });
            const loggerService = loggerServiceFactory();
            const stateService = stateServiceFactory({ loggerService })({
              ...EMPTY_STATE,
              entityList: [{ ...MOCK_PLAYER, currentPosition, id: entityId }],
            });
            const timeService = timeServiceFactory({
              configService,
              loggerService,
              stateService,
            })();
            const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
            const maybeDisplacement: Displacement = testedModule.createDisplacement(
              {
                loggerService,
                stateService,
              },
            )({
              entityId,
              target: targetCoordinates,
            });
            test.equal(
              !!maybeDisplacement &&
                typeof maybeDisplacement.executor === 'function' &&
                typeof maybeDisplacement.id === 'string' &&
                maybeDisplacement.targetCoordinates === targetCoordinates &&
                maybeDisplacement.type === ActionType.DISPLACEMENT,
              true,
              'SHOULD return a Displacement object',
            );
            return maybeDisplacement
              .executor({
                loggerService,
                stateService,
                timeService,
              })
              .then(() => {
                test.pass(
                  `AND this object SHOULD have an executor method that returns a Promise`,
                );
                test.throws(
                  () => timeService.findAction(maybeDisplacement.id),
                  `AND there should be no additionnal displacement planned`,
                );
                test.end();
              });
          },
        );
      },
    );

    given.test(
      'GIVEN an entity that is not located at its target coordinates',
      (when: tape.Test) => {
        when.test(
          'WHEN called with this entity id and target coordinates',
          (test: tape.Test) => {
            test.plan(3);
            const entityId: Id = 'foo';
            const currentPosition: Position = { x: 0, y: 0, z: 0 };
            const configService = configServiceFactory({ ...DEFAULT_CONFIG });
            const loggerService = loggerServiceFactory();
            const stateService = stateServiceFactory({ loggerService })({
              ...EMPTY_STATE,
              entityList: [{ ...MOCK_PLAYER, currentPosition, id: entityId }],
            });
            const timeService = timeServiceFactory({
              configService,
              loggerService,
              stateService,
            })();
            const targetCoordinates: Position = { x: 10, y: 10, z: 10 };
            const maybeDisplacement: Displacement = testedModule.createDisplacement(
              {
                loggerService,
                stateService,
              },
            )({
              entityId,
              target: targetCoordinates,
            });
            test.equal(
              !!maybeDisplacement &&
                typeof maybeDisplacement.executor === 'function' &&
                typeof maybeDisplacement.id === 'string' &&
                maybeDisplacement.targetCoordinates === targetCoordinates &&
                maybeDisplacement.type === ActionType.DISPLACEMENT,
              true,
              'SHOULD return a Displacement object',
            );
            return maybeDisplacement
              .executor({
                loggerService,
                stateService,
                timeService,
              })
              .then(() => {
                test.pass(
                  `AND this object SHOULD have an executor method that returns a Promise`,
                );
                const action = timeService.findAction(maybeDisplacement.id);
                test.equal(
                  action.id,
                  maybeDisplacement.id,
                  `AND there should be an additionnal displacement planned`,
                );
                test.end();
              });
          },
        );
      },
    );
  });

  functions.test('displaceEntityMutator()', (when: tape.Test) => {
    when.test(
      'WHEN called with a state AND a displacement payload',
      (test: tape.Test) => {
        test.plan(1);
        const entityId: Id = 'foo';
        const playerA: Player = { ...MOCK_PLAYER, id: entityId + 'A' };
        const playerB: Player = { ...MOCK_PLAYER, id: entityId };
        const playerC: Player = { ...MOCK_PLAYER, id: entityId + 'C' };
        const initalState: State = {
          ...EMPTY_STATE,
          entityList: [playerA, playerB, playerC],
        };
        const newPosition: Position = { x: 1, y: 2, z: 3 };
        test.deepEqual(
          testedModule.displaceEntityMutator(initalState)({
            entityId,
            newPosition,
          }),
          {
            ...initalState,
            entityList: [
              playerA,
              { ...playerB, currentPosition: newPosition },
              playerC,
            ],
          },
          'SHOULD return an appropriately mutated state',
        );
        test.end();
      },
    );
  });
});
