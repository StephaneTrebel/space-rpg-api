import tape from 'tape';

import { MOCK_PLAYER } from '../../handlers/player/create/handler';

import { createEntity } from '../../utils/entity/utils';
import { EntityList } from '../../utils/entity/types';
import { Id } from '../../utils/id/types';

import { loggerServiceFactory } from '../logger/service';

import { StateProperties } from './types';

import * as testedModule from './service';

tape('State Service', (functionTest: tape.Test) => {
  functionTest.test('get()', (test: tape.Test) => {
    test.plan(1);
    const MOCK_ENTITY_LIST: EntityList = [createEntity({ ...MOCK_PLAYER })];
    const loggerService = loggerServiceFactory();
    test.deepEqual(
      testedModule
        .stateServiceFactory({ loggerService })({
          entityList: MOCK_ENTITY_LIST,
        })
        .get(StateProperties.ENTITY_LIST),
      MOCK_ENTITY_LIST,
      'SHOULD retrieve entityList from a State',
    );
    test.end();
  });

  functionTest.test('findEntity()', (given: tape.Test) => {
    given.test('GIVEN a State that has an entity', (when: tape.Test) => {
      when.test(
        'WHEN called with an entity id that does not exist in State',
        (test: tape.Test) => {
          test.plan(1);
          const id: Id = 'bar';
          const entity = createEntity({
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
              }),
            'SHOULD throw an error',
          );
          test.end();
        },
      );

      when.test(
        'WHEN called with an entity id that exists in State',
        (test: tape.Test) => {
          test.plan(1);
          const id: Id = 'bar';
          const entity = createEntity({
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
          const entity = createEntity({
            ...MOCK_PLAYER,
            id,
          });
          const loggerService = loggerServiceFactory();
          test.equal(
            testedModule.findEntity({
              loggerService,
            })({ ...testedModule.EMPTY_STATE, entityList: [entity] })({
              id,
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
