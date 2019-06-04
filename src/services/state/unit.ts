import tape from 'tape';

import { EMPTY_UNIVERSE } from '../../assets/universe';
import { Player } from '../../handlers/player/types';
import {
  createMockPlayer,
  MOCK_PLAYER,
} from '../../handlers/player/create/handler';
import { Id } from '../../types/id';

import { loggerServiceFactory } from '../logger/service';

import { StateProperties } from './types';

import * as testedModule from './service';
import { EntityType, BaseEntity } from '../../types/entity';

tape('State Service', (functionTest: tape.Test) => {
  functionTest.test('get()', (test: tape.Test) => {
    test.plan(1);
    const MOCK_PLAYER_LIST: Array<Player> = [createMockPlayer()];
    const loggerService = loggerServiceFactory();
    test.deepEqual(
      testedModule
        .stateServiceFactory({ loggerService })({
          entityList: MOCK_PLAYER_LIST,
          universe: EMPTY_UNIVERSE,
        })
        .get(StateProperties.ENTITY_LIST),
      MOCK_PLAYER_LIST,
      'SHOULD retrieve entityList from a State',
    );
    test.end();
  });

  functionTest.test('findEntity()', (given: tape.Test) => {
    given.test('GIVEN a State that has entities', (when: tape.Test) => {
      when.test(
        'WHEN called with an entity id that does not exist in State',
        (test: tape.Test) => {
          test.plan(1);
          const id: Id = 'bar';
          const entity: Player = createMockPlayer({
            ...MOCK_PLAYER,
            id,
          });
          const loggerService = loggerServiceFactory();
          test.throws(
            () =>
              testedModule.findEntity({
                loggerService,
              })({
                ...testedModule.EMPTY_STATE,
                entityList: [entity],
              })({
                id: 'qux',
                type: EntityType.PLAYER,
              }),
            'SHOULD throw an error',
          );
          test.end();
        },
      );

      when.test(
        'WHEN called with an id and a type that does not match to the entity',
        (test: tape.Test) => {
          test.plan(1);
          const id: Id = 'bar';
          const entity: BaseEntity = {
            currentPosition: { x: 0, y: 0, z: 0 },
            id,
            type: EntityType.MOCK,
          };
          const loggerService = loggerServiceFactory();
          test.throws(
            () =>
              testedModule.findEntity({
                loggerService,
              })({ ...testedModule.EMPTY_STATE, entityList: [entity as any] })({
                id,
                type: EntityType.PLAYER,
              }),
            'SHOULD throw an error',
          );
          test.end();
        },
      );

      when.test(
        'WHEN called with an id and a type that does match to the entity',
        (test: tape.Test) => {
          test.plan(1);
          const id: Id = 'bar';
          const entity: Player = createMockPlayer({
            ...MOCK_PLAYER,
            currentPosition: { x: 0, y: 0, z: 0 },
            id,
          });
          const loggerService = loggerServiceFactory();
          test.equal(
            testedModule.findEntity({
              loggerService,
            })({ ...testedModule.EMPTY_STATE, entityList: [entity] })({
              id,
              type: EntityType.PLAYER,
            }),
            entity,
            'SHOULD return the entity',
          );
          test.end();
        },
      );
    });

    given.test('findEntity()', (when: tape.Test) => {
      when.test(
        'WHEN given an entity id and a State having this entity',
        (test: tape.Test) => {
          test.plan(1);
          const id: Id = 'bar';
          const entity: Player = createMockPlayer({
            ...MOCK_PLAYER,
            id,
          });
          const loggerService = loggerServiceFactory();
          test.equal(
            testedModule.findEntity({
              loggerService,
            })({ ...testedModule.EMPTY_STATE, entityList: [entity] })({
              id,
              type: EntityType.PLAYER,
            }),
            entity,
            'SHOULD return the entity',
          );
          test.end();
        },
      );
    });
  });
});
