import tape from 'tape';

import { loggerServiceFactory } from '../../../services/logger/service';
import {
	stateServiceFactory,
	EMPTY_STATE,
} from '../../../services/state/service';

import { Id } from '../../../utils/id/types';
import { Entity, EntityType } from '../../../utils/entity/types';
import { createEntity } from '../../../utils/entity/utils';

import * as testedModule from './handler';

tape('Entity handler', (functions: tape.Test) => {
	functions.test('getEntityFromStateService()', (cases: tape.Test) => {
		cases.test(
			'WHEN given an entity id and a StateService lacking this entity',
			(test: tape.Test) => {
				test.plan(1);
				const id: Id = 'bar';
				const entity: Entity = createEntity(EntityType.MOCK)({
					id,
				});
				const loggerService = loggerServiceFactory();
				const stateService = stateServiceFactory({ loggerService })({
					...EMPTY_STATE,
					entityList: [entity],
				});
				test.throws(
					() =>
						testedModule.getEntityFromStateService({
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
			'WHEN given an entity id and a StateService having this entity',
			(test: tape.Test) => {
				test.plan(1);
				const id: Id = 'bar';
				const entity: Entity = createEntity(EntityType.MOCK)({
					id,
				});
				const loggerService = loggerServiceFactory();
				const stateService = stateServiceFactory({ loggerService })({
					...EMPTY_STATE,
					entityList: [entity],
				});
				test.equal(
					testedModule.getEntityFromStateService({
						loggerService,
						stateService,
					})({ id }),
					entity,
					'SHOULD return the entity',
				);
				test.end();
			},
		);
	});

	functions.test('getEntity()', (cases: tape.Test) => {
		cases.test(
			'WHEN given an entity and a StateService lacking this entity',
			(test: tape.Test) => {
				test.plan(3);
				const id: Id = 'getEntity';
				const loggerService = loggerServiceFactory();
				const stateService = stateServiceFactory({ loggerService })(
					EMPTY_STATE,
				);
				return testedModule
					.getEntityDetails({
						loggerService,
						stateService,
					})({ request: { params: { id } } } as any)
					.then(handlerResponse => {
						test.equal(
							handlerResponse.status,
							400,
							'SHOULD return a 400 response',
						);
						test.equal(
							typeof handlerResponse.json.code,
							'string',
							'SHOULD return a body having a string code property',
						);
						test.equal(
							typeof handlerResponse.json.message,
							'string',
							'SHOULD return a body having a string message property',
						);
						test.end();
					});
			},
		);

		cases.test(
			'WHEN given an entity and a StateService having this entity',
			(test: tape.Test) => {
				test.plan(3);
				const id: Id = 'getEntity';
				const entity: Entity = createEntity(EntityType.MOCK)({
					id,
				});
				const loggerService = loggerServiceFactory();
				const stateService = stateServiceFactory({ loggerService })({
					...EMPTY_STATE,
					entityList: [entity],
				});
				return testedModule
					.getEntityDetails({
						loggerService,
						stateService,
					})({ request: { params: { id } } } as any)
					.then(handlerResponse => {
						test.equal(
							handlerResponse.status,
							200,
							'SHOULD return a 200 response',
						);
						test.deepEqual(
							handlerResponse.json.entity,
							entity,
							'SHOULD return a body having a entity object',
						);
						test.deepEqual(
							handlerResponse.json.links,
							[],
							'SHOULD return a body having an empty link list',
						);
						test.end();
					});
			},
		);
	});
});
