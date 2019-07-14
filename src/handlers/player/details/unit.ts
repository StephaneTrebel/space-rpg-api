import tape from 'tape';

import { EntityType } from '../../../utils/entity/types';
import { Id } from '../../../utils/id/types';
import { createEntity } from '../../../utils/entity/utils';
import { createPlayer } from '../../../utils/player/utils';

import { loggerServiceFactory } from '../../../services/logger/service';
import {
	stateServiceFactory,
	EMPTY_STATE,
} from '../../../services/state/service';

import * as testedModule from './handler';

tape('Player handler', (functions: tape.Test) => {
	functions.test('getPlayerDetails()', (given: tape.Test) => {
		given.test(
			`GIVEN given a player
    AND a StateService lacking this player`,
			(when: tape.Test) =>
				when.test(
					`WHEN called with a Context having this player id
    as a request path parameter`,
					(test: tape.Test) => {
						test.plan(3);
						const id: Id = 'getPlayerDetailsFailure';
						const loggerService = loggerServiceFactory();
						const stateService = stateServiceFactory({ loggerService })(
							EMPTY_STATE,
						);
						const handlerResponse = testedModule.getPlayerDetails({
							loggerService,
							stateService,
						})({ request: { params: { id } } } as any);
						test.equal(
							handlerResponse.status,
							400,
							'SHOULD sucessfully return a 400 response',
						);
						test.equal(
							typeof handlerResponse.json.code,
							'string',
							'SHOULD sucessfully return a body having a string code property',
						);
						test.equal(
							typeof handlerResponse.json.message,
							'string',
							'SHOULD sucessfully return a body having a string message property',
						);
						test.end();
					},
				),
		);

		given.test(
			`GIVEN given a player that has no entity nearby
    AND a StateService having this player`,
			(when: tape.Test) =>
				when.test(
					`WHEN called with a Context having this player id
    as a request path parameter`,
					(test: tape.Test) => {
						test.plan(2);
						const id: Id = 'getPlayer';
						const player = createPlayer({
							id,
						});
						const loggerService = loggerServiceFactory();
						const stateService = stateServiceFactory({ loggerService })({
							...EMPTY_STATE,
							entityList: [player],
						});
						const handlerResponse = testedModule.getPlayerDetails({
							loggerService,
							stateService,
						})({ request: { params: { id } } } as any);
						test.equal(
							handlerResponse.status,
							200,
							'SHOULD sucessfully return a 200 response',
						);
						test.deepEqual(
							handlerResponse.json,
							{ player, nearby: [], links: [] },
							'SHOULD sucessfully return the expected (player, links) body',
						);
						test.end();
					},
				),
		);

		given.test(
			`GIVEN a StateService having a player and at least two other entities
      AND that player is near two of them`,
			(when: tape.Test) => {
				const id: Id = 'foo';
				const player = createPlayer({
					currentPosition: { x: 0, y: 0, z: 0 },
					id,
				});
				const nearbyEntity1 = createEntity(EntityType.MOCK)({
					currentPosition: { x: 0.2, y: 0.2, z: 0.1 },
					id: 'nearbyEntity1',
				});
				const nearbyEntity2 = createEntity(EntityType.MOCK)({
					currentPosition: { x: -0.2, y: -0.1, z: 0.2 },
					id: 'nearbyEntity2',
				});
				const loggerService = loggerServiceFactory();
				const stateService = stateServiceFactory({ loggerService })({
					...EMPTY_STATE,
					entityList: [
						createEntity(EntityType.MOCK)({
							currentPosition: { x: 10, y: 10, z: 10 },
							id: 'farAwayEntity1',
						}),
						nearbyEntity1,
						player,
						createEntity(EntityType.MOCK)({
							currentPosition: { x: 10, y: 10, z: 10 },
							id: 'farAwayEntity2',
						}),
						nearbyEntity2,
						createEntity(EntityType.MOCK)({
							currentPosition: { x: 10, y: 10, z: 10 },
							id: 'farAwayEntity3',
						}),
					],
				});
				when.test(
					`WHEN called with a Context having this player id
    as a request path parameter`,
					(test: tape.Test) => {
						test.plan(2);
						const handlerResponse = testedModule.getPlayerDetails({
							loggerService,
							stateService,
						})({ request: { params: { id } } });
						test.equal(
							handlerResponse.status,
							200,
							'SHOULD sucessfully return a 200 response',
						);
						test.deepEqual(
							handlerResponse.json,
							{ nearby: [nearbyEntity1, nearbyEntity2], player, links: [] },
							'SHOULD sucessfully return a body with the expected properties',
						);
						test.end();
					},
				);
			},
		);
	});
});
