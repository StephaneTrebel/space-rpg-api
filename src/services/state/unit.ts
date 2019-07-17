import tape from 'tape';

import { EntityType } from '../../utils/entity/types';
import { createEntity } from '../../utils/entity/utils';
import { Id } from '../../utils/id/types';

import { loggerServiceFactory } from '../logger/service';
import * as testedModule from './service';

tape('State Service', (functionTest: tape.Test) => {
	functionTest.test('findEntity()', (cases: tape.Test) => {
		cases.test(
			`GIVEN a State service internal
	WHEN called with an entity id that does not exist in this State`,
			(test: tape.Test) => {
				test.plan(1);
				const id: Id = 'bar';
				const entity = createEntity(EntityType.MOCK)({
					id,
				});
				const loggerService = loggerServiceFactory();
				test.throws(
					() =>
						testedModule.findEntity({
							loggerService,
						})({
							state: {
								...testedModule.EMPTY_STATE,
								entityList: [entity],
							},
						})({
							id: 'qux',
						}),
					'SHOULD throw an error',
				);
				test.end();
			},
		);

		cases.test(
			`GIVEN a State service internal
	WHEN called with an entity id that exists in this State`,
			(test: tape.Test) => {
				test.plan(1);
				const id: Id = 'bar';
				const entity = createEntity(EntityType.MOCK)({
					currentPosition: { x: 0, y: 0, z: 0 },
					id,
				});
				const loggerService = loggerServiceFactory();
				test.equal(
					testedModule.findEntity({
						loggerService,
					})({
						state: { ...testedModule.EMPTY_STATE, entityList: [entity] },
					})({
						id,
					}),
					entity,
					'SHOULD return the entity',
				);
				test.end();
			},
		);
	});

	functionTest.test('getNearbyEntities()', (cases: tape.Test) => {
		cases.test(
			`GIVEN a State service internal that has entities
	WHEN called with one of the entities Id`,
			(test: tape.Test) => {
				test.plan(1);
				const id: Id = 'myEntity';
				const entity = createEntity(EntityType.MOCK)({
					currentPosition: { x: 0, y: 0, z: 0 },
					id,
				});
				const neighbourA = createEntity(EntityType.MOCK)({
					currentPosition: { x: 1, y: 1, z: 1 },
					id: 'neighbourA',
				});
				const neighbourB = createEntity(EntityType.MOCK)({
					currentPosition: { x: -1, y: -1, z: -1 },
					id: 'neighbourB',
				});
				const neighbourC = createEntity(EntityType.MOCK)({
					currentPosition: { x: 6, y: 6, z: 6 },
					id: 'neighbourC',
				});
				const neighbourD = createEntity(EntityType.MOCK)({
					currentPosition: { x: -6, y: -6, z: -6 },
					id: 'neighbourD',
				});
				const loggerService = loggerServiceFactory();
				test.deepEqual(
					testedModule.getNearbyEntities({
						loggerService,
					})({
						state: {
							...testedModule.EMPTY_STATE,
							entityList: [
								entity,
								neighbourA,
								neighbourB,
								neighbourC,
								neighbourD,
							],
						},
					})({
						id,
					}),
					[neighbourA, neighbourB],
					'SHOULD return the entities that are near this entity',
				);
				test.end();
			},
		);
	});
});
