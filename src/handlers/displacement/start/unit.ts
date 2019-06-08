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
import { LinkList } from '../../../services/webserver/types';

import { Id } from '../../../types/id';
import { Position } from '../../../types/position';

import { createPlayer, MOCK_PLAYER } from '../../player/create/handler';
import { Player } from '../../player/types';

import { Displacement } from '../types';

import * as testedModule from './handler';

tape('Displacement handler', (functionTest: tape.Test) => {
  functionTest.test('movePosition()', (when: tape.Test) => {
    when.test(
      `WHEN given a point in space
        AND a target
        AND a distance per tick`,
      (test: tape.Test) => {
        test.plan(1);
        const loggerService = loggerServiceFactory();
        test.deepEqual(
          testedModule.movePosition({ loggerService })({
            currentPosition: { x: 0, y: 0, z: 0 },
            distancePerTick: 3,
            targetPosition: { x: 10, y: 10, z: 10 },
          }),
          {
            x: 1.7320508075688772,
            y: 1.7320508075688772,
            z: 1.7320508075688772,
          },
          'SHOULD return the point displaced toward its target after one tick',
        );
        test.end();
      },
    );

    when.test(
      `WHEN given a point in space
        AND a target
        AND a distance per tick that is WAAAAAAAY TOOOOO HIGH`,
      (test: tape.Test) => {
        test.plan(1);
        const loggerService = loggerServiceFactory();
        test.deepEqual(
          testedModule.movePosition({ loggerService })({
            currentPosition: { x: 0, y: 0, z: 0 },
            distancePerTick: 1000,
            targetPosition: { x: 10, y: 10, z: 10 },
          }),
          {
            x: 10,
            y: 10,
            z: 10,
          },
          'SHOULD return the point exactly at its target after one tick',
        );
        test.end();
      },
    );

    when.test(
      `WHEN given a point in space
        AND a target that is "behind"
        AND a distance per tick`,
      (test: tape.Test) => {
        test.plan(1);
        const loggerService = loggerServiceFactory();
        test.deepEqual(
          testedModule.movePosition({ loggerService })({
            currentPosition: { x: 10, y: 10, z: 10 },
            distancePerTick: 3,
            targetPosition: { x: 0, y: 0, z: 0 },
          }),
          {
            x: 8.267949192431123,
            y: 8.267949192431123,
            z: 8.267949192431123,
          },
          'SHOULD return the point displaced toward its target after one tick',
        );
        test.end();
      },
    );

    when.test(
      `WHEN given a point in space
        AND a target that is "behind"
        AND a distance per tick that is WAAAAAAAY TOOOOO HIGH`,
      (test: tape.Test) => {
        test.plan(1);
        const loggerService = loggerServiceFactory();
        test.deepEqual(
          testedModule.movePosition({ loggerService })({
            currentPosition: { x: 10, y: 10, z: 10 },
            distancePerTick: 1000,
            targetPosition: { x: 0, y: 0, z: 0 },
          }),
          {
            x: 0,
            y: 0,
            z: 0,
          },
          'SHOULD return the point exactly at its target after one tick',
        );
        test.end();
      },
    );
  });

  functionTest.test('isSamePosition()', (when: tape.Test) => {
    when.test('WHEN given two different positions', (test: tape.Test) => {
      test.plan(1);
      test.equal(
        testedModule.isSamePosition({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 }),
        false,
        'SHOULD return false',
      );
      test.end();
    });

    when.test('WHEN given two identical positions', (test: tape.Test) => {
      test.plan(1);
      test.equal(
        testedModule.isSamePosition({ x: 4, y: 5, z: 6 }, { x: 4, y: 5, z: 6 }),
        true,
        'SHOULD return true',
      );
      test.end();
    });
  });

  functionTest.test('createDisplacement()', (given: tape.Test) => {
    given.test(
      'GIVEN an entity that is located at its target coordinates',
      (when: tape.Test) => {
        when.test(
          'WHEN called with this entity id and target coordinates',
          (test: tape.Test) => {
            test.plan(3);
            const entityId: Id = 'foo';
            const currentPosition: Position = { x: 0, y: 0, z: 0 };
            const configService = configServiceFactory();
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
              },
            )({
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
                test.throws(
                  () =>
                    timeService.findAction({
                      id: maybeDisplacement.id,
                    }),
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
            const configService = configServiceFactory();
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
              },
            )({
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
                const action = timeService.findAction({
                  id: maybeDisplacement.id,
                });
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

  functionTest.test('getTargetCoordinatesFromContext()', (when: tape.Test) => {
    when.test('WHEN given a Context object', (test: tape.Test) => {
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

  functionTest.test('getEntityIdFromContext()', (when: tape.Test) => {
    when.test('WHEN given a Context object', (test: tape.Test) => {
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

  functionTest.test('getEntityCurrentPosition()', (when: tape.Test) => {
    when.test(
      'WHEN given an entity and a State having this entity',
      (test: tape.Test) => {
        test.plan(1);
        const id: Id = 'getEntityCurrentPosition';
        const currentPosition: Position = {
          x: 124,
          y: 456,
          z: 789,
        };
        const entity: Player = createPlayer({
          ...MOCK_PLAYER,
          currentPosition,
          id,
        });
        const loggerService = loggerServiceFactory();
        test.equal(
          testedModule.getEntityCurrentPosition({
            id,
            loggerService,
            stateService: stateServiceFactory({ loggerService })({
              ...EMPTY_STATE,
              entityList: [entity],
            }),
          }),
          currentPosition,
          'SHOULD return the entity current position',
        );
        test.end();
      },
    );
  });

  functionTest.test('displaceEntityMutator()', (when: tape.Test) => {
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

  functionTest.test('startDisplacement()', (when: tape.Test) => {
    when.test(
      'WHEN given an entity and a State having this entity',
      (test: tape.Test) => {
        test.plan(3);
        const testId: Id = 'startDisplacement';
        const currentPosition: Position = {
          x: 271,
          y: 923,
          z: 391,
        };
        const entity: Player = createPlayer({
          ...MOCK_PLAYER,
          currentPosition,
          id: testId,
        });
        const configService = configServiceFactory();
        const loggerService = loggerServiceFactory();
        const stateService = stateServiceFactory({ loggerService })({
          ...EMPTY_STATE,
          entityList: [entity],
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
