import tape from 'tape';

import { configServiceFactory } from '../../../services/config/service';
import { loggerServiceFactory } from '../../../services/logger/service';
import {
  stateServiceFactory,
  EMPTY_STATE,
} from '../../../services/state/service';
import { timeServiceFactory } from '../../../services/time/service';
import { ActionType } from '../../../services/time/types';
import { LinkList } from '../../../services/webserver/service';

import { Id } from '../../../types/id';
import { Position } from '../../../types/position';

import { createMockPlayer, MOCK_PLAYER } from '../../player/create/handler';
import { Player } from '../../player/types';

import { Displacement } from '../types';

import * as testedModule from './handler';

tape('Displacement handler', (functions: tape.Test) => {
  functions.test('createDisplacement()', (cases: tape.Test) => {
    cases.test('WHEN given proper parameters', (test: tape.Test) => {
      test.plan(2);
      const currentPosition: Position = { x: 0, y: 0, z: 0 };
      const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
      const maybeDisplacement: Displacement = testedModule.createDisplacement({
        currentPosition,
        targetCoordinates,
      });
      test.equal(
        !!maybeDisplacement &&
          maybeDisplacement.currentPosition === currentPosition &&
          typeof maybeDisplacement.executor === 'function' &&
          typeof maybeDisplacement.id === 'string' &&
          maybeDisplacement.targetCoordinates === targetCoordinates &&
          maybeDisplacement.type === ActionType.DISPLACEMENT,
        true,
        'SHOULD return a Displacement object',
      );
      return maybeDisplacement.executor('ignore' as any).then(() => {
        test.pass(
          `AND this object SHOULD have an executor method that returns a Promise`,
        );
        test.end();
      });
    });
  });

  functions.test('getTargetCoordinatesFromContext()', (cases: tape.Test) => {
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

  functions.test('getEntityIdFromContext()', (cases: tape.Test) => {
    cases.test('WHEN given a Context object', (test: tape.Test) => {
      test.plan(1);
      const entityId: Id = 'foo';
      const context: any = {
        request: { requestBody: { entityId } },
      };
      test.equal(
        testedModule.getEntityIdFromContext(context),
        entityId,
        'SHOULD return the Context entity id',
      );
      test.end();
    });
  });

  functions.test('getEntityFromState()', (cases: tape.Test) => {
    cases.test(
      'WHEN given an entity id and a State lacking this entity',
      (test: tape.Test) => {
        test.plan(1);
        const entityId: Id = 'bar';
        const entity: Player = createMockPlayer({
          ...MOCK_PLAYER,
          username: entityId,
        });
        test.throws(
          () =>
            testedModule.getEntityFromState({
              entityId: 'qux',
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
        const entityId: Id = 'bar';
        const entity: Player = createMockPlayer({
          ...MOCK_PLAYER,
          username: entityId,
        });
        test.equal(
          testedModule.getEntityFromState({
            entityId,
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

  functions.test('getEntityCurrentPosition()', (cases: tape.Test) => {
    cases.test(
      'WHEN given an entity and a State having this entity',
      (test: tape.Test) => {
        test.plan(1);
        const entityId: Id = 'getEntityCurrentPosition';
        const currentPosition: Position = {
          x: 124,
          y: 456,
          z: 789,
        };
        const entity: Player = createMockPlayer({
          ...MOCK_PLAYER,
          currentPosition,
          username: entityId,
        });
        test.equal(
          testedModule.getEntityCurrentPosition({
            entityId,
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

  functions.test('startDisplacement()', (cases: tape.Test) => {
    cases.test(
      'WHEN given an entity and a State having this entity',
      (test: tape.Test) => {
        test.plan(3);
        const entityId: Id = 'startDisplacement';
        const currentPosition: Position = {
          x: 271,
          y: 923,
          z: 391,
        };
        const entity: Player = createMockPlayer({
          ...MOCK_PLAYER,
          currentPosition,
          username: entityId,
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
        });
        testedModule.startDisplacement({
          id: entityId,
          stateService,
          timeService,
        })(
          { request: { requestBody: { entityId } } } as any,
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
                      href: `/target/${entityId}`,
                      rel: 'status',
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
