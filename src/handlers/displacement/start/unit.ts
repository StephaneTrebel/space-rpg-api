import tape from 'tape';

import { configServiceFactory } from '../../../services/config/service';
import { loggerServiceFactory } from '../../../services/logger/service';
import {
  stateServiceFactory,
  EMPTY_STATE,
} from '../../../services/state/service';
import { State } from '../../../services/state/types';
import { timeServiceFactory } from '../../../services/time/service';
import { ActionType } from '../../../services/time/types';
import { LinkList } from '../../../services/webserver/service';

import { Id } from '../../../types/id';
import { Position } from '../../../types/position';

import { createMockPlayer, MOCK_PLAYER } from '../../player/create/handler';
import { Player } from '../../player/types';

import { Displacement } from '../types';

import * as testedModule from './handler';

tape('Displacement handler', (functionTest: tape.Test) => {
  functionTest.test('moveTowards()', (cases: tape.Test) => {
    cases.test(
      `WHEN given a current coordinate,
    AND a target coordinate that is farther forward
    AND a speed`,
      (test: tape.Test) => {
        test.plan(1);
        const currentCoordinate: number = 0;
        const targetCoordinate: number = 10;
        const speed: number = 3;
        test.equal(
          testedModule.moveTowards(currentCoordinate, targetCoordinate, speed),
          3,
          'SHOULD return an appropriately moved coordinate',
        );
        test.end();
      },
    );

    cases.test(
      `WHEN given a current coordinate,
    AND a target coordinate that is farther behind
    AND a speed`,
      (test: tape.Test) => {
        test.plan(1);
        const currentCoordinate: number = 0;
        const targetCoordinate: number = -10;
        const speed: number = 3;
        test.equal(
          testedModule.moveTowards(currentCoordinate, targetCoordinate, speed),
          -3,
          'SHOULD return an appropriately moved coordinate',
        );
        test.end();
      },
    );

    cases.test(
      `WHEN given a current coordinate,
    AND a forwardly placed target coordinate that can be reached in one tick
    AND a speed`,
      (test: tape.Test) => {
        test.plan(1);
        const currentCoordinate: number = 0;
        const targetCoordinate: number = 2;
        const speed: number = 3;
        test.equal(
          testedModule.moveTowards(currentCoordinate, targetCoordinate, speed),
          2,
          'SHOULD return an appropriately moved coordinate',
        );
        test.end();
      },
    );

    cases.test(
      `WHEN given a current coordinate,
    AND a behindly placed target coordinate that can be reached in one tick
    AND a speed`,
      (test: tape.Test) => {
        test.plan(1);
        const currentCoordinate: number = 0;
        const targetCoordinate: number = -2;
        const speed: number = 3;
        test.equal(
          testedModule.moveTowards(currentCoordinate, targetCoordinate, speed),
          -2,
          'SHOULD return an appropriately moved coordinate',
        );
        test.end();
      },
    );
  });

  functionTest.test('createDisplacement()', (cases: tape.Test) => {
    cases.test('WHEN given proper parameters', (test: tape.Test) => {
      test.plan(2);
      const entityId: Id = 'foo';
      const currentPosition: Position = { x: 0, y: 0, z: 0 };
      const configService = configServiceFactory();
      const loggerService = loggerServiceFactory();
      const stateService = stateServiceFactory({
        ...EMPTY_STATE,
        playerList: [{ ...MOCK_PLAYER, currentPosition, id: entityId }],
      });
      const timeService = timeServiceFactory({
        configService,
        loggerService,
        stateService,
      })();
      const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
      const maybeDisplacement: Displacement = testedModule.createDisplacement({
        loggerService,
      })({
        entityId,
        targetCoordinates,
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
          test.end();
        });
    });
  });

  functionTest.test('getTargetCoordinatesFromContext()', (cases: tape.Test) => {
    cases.test('WHEN given a Context object', (test: tape.Test) => {
      test.plan(1);
      const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
      const context: any = {
        request: { requestBody: { targetCoordinates } },
      };
      test.equal(
        testedModule.getTargetCoordinatesFromContext(context),
        targetCoordinates,
        'SHOULD return the Context target coordinates',
      );
      test.end();
    });
  });

  functionTest.test('getEntityIdFromContext()', (cases: tape.Test) => {
    cases.test('WHEN given a Context object', (test: tape.Test) => {
      test.plan(1);
      const id: Id = 'foo';
      const context: any = {
        request: { requestBody: { entityId: id } },
      };
      test.equal(
        testedModule.getEntityIdFromContext(context),
        id,
        'SHOULD return the Context entity id',
      );
      test.end();
    });
  });

  functionTest.test('getEntityFromState()', (cases: tape.Test) => {
    cases.test(
      'WHEN given an entity id and a State lacking this entity',
      (test: tape.Test) => {
        test.plan(1);
        const id: Id = 'bar';
        const entity: Player = createMockPlayer({
          ...MOCK_PLAYER,
          id,
        });
        test.throws(
          () =>
            testedModule.getEntityFromState({
              id: 'qux',
              loggerService: loggerServiceFactory(),
              stateService: stateServiceFactory({
                ...EMPTY_STATE,
                playerList: [entity],
              }),
            }),
          'SHOULD throw an error',
        );
        test.end();
      },
    );

    cases.test(
      'WHEN given an entity id and a State having this entity',
      (test: tape.Test) => {
        test.plan(1);
        const id: Id = 'bar';
        const entity: Player = createMockPlayer({
          ...MOCK_PLAYER,
          id,
        });
        test.equal(
          testedModule.getEntityFromState({
            id,
            loggerService: loggerServiceFactory(),
            stateService: stateServiceFactory({
              ...EMPTY_STATE,
              playerList: [entity],
            }),
          }),
          entity,
          'SHOULD return the entity',
        );
        test.end();
      },
    );
  });

  functionTest.test('getEntityCurrentPosition()', (cases: tape.Test) => {
    cases.test(
      'WHEN given an entity and a State having this entity',
      (test: tape.Test) => {
        test.plan(1);
        const id: Id = 'getEntityCurrentPosition';
        const currentPosition: Position = {
          x: 124,
          y: 456,
          z: 789,
        };
        const entity: Player = createMockPlayer({
          ...MOCK_PLAYER,
          currentPosition,
          id,
        });
        test.equal(
          testedModule.getEntityCurrentPosition({
            id,
            loggerService: loggerServiceFactory(),
            stateService: stateServiceFactory({
              ...EMPTY_STATE,
              playerList: [entity],
            }),
          }),
          currentPosition,
          'SHOULD return the entity current position',
        );
        test.end();
      },
    );
  });

  functionTest.test('displaceEntityMutator()', (cases: tape.Test) => {
    cases.test(
      'WHEN called with a state AND a displacement payload',
      (test: tape.Test) => {
        test.plan(1);
        const entityId: Id = 'foo';
        const playerA: Player = { ...MOCK_PLAYER, id: entityId + 'A' };
        const playerB: Player = { ...MOCK_PLAYER, id: entityId };
        const playerC: Player = { ...MOCK_PLAYER, id: entityId + 'C' };
        const initalState: State = {
          ...EMPTY_STATE,
          playerList: [playerA, playerB, playerC],
        };
        const newPosition: Position = { x: 1, y: 2, z: 3 };
        test.deepEqual(
          testedModule.displaceEntityMutator(initalState)({
            entityId,
            newPosition,
          }),
          {
            ...initalState,
            playerList: [
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

  functionTest.test('startDisplacement()', (cases: tape.Test) => {
    cases.test(
      'WHEN given an entity and a State having this entity',
      (test: tape.Test) => {
        test.plan(3);
        const testId: Id = 'startDisplacement';
        const currentPosition: Position = {
          x: 271,
          y: 923,
          z: 391,
        };
        const entity: Player = createMockPlayer({
          ...MOCK_PLAYER,
          currentPosition,
          id: testId,
        });
        const configService = configServiceFactory();
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({
          ...EMPTY_STATE,
          playerList: [entity],
        });
        const timeService = timeServiceFactory({
          configService,
          loggerService,
          stateService,
        })();
        testedModule.startDisplacement({
          loggerService,
          testId,
          timeService,
        })(
          { request: { requestBody: { entityId: testId } } } as any,
          {} as any,
          {
            status: (returnedStatus: number) => ({
              json: (returnedJSON: {
                links: LinkList;
                displacementId: string;
              }) => {
                test.equal(
                  returnedStatus,
                  201,
                  'SHOULD sucessfully return a 201 response',
                );
                test.equal(
                  typeof returnedJSON.displacementId,
                  'string',
                  'SHOULD sucessfully return a body having a displacementId property',
                );
                test.deepEqual(
                  returnedJSON.links,
                  [
                    {
                      href: `/displacement/${testId}`,
                      rel: 'details',
                    },
                  ],
                  'SHOULD sucessfully return a body having a link to /displacement endpoint',
                );
                test.end();
              },
            }),
          } as any,
        );
      },
    );
  });
});
