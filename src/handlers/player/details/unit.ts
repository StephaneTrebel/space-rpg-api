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

const moduleName = 'Player details handler';

tape(
	`${moduleName}
	getPlayerDetailsText()
		GIVEN a LoggerService
		WHEN called with a new player`,
	(test: tape.Test) => {
		test.plan(1);
		const MOCK_PLAYER_NAME = 'playerDetails';
		test.equal(
			typeof testedModule.getPlayerDetailsText({
				loggerService: loggerServiceFactory(),
			})({
				player: createPlayer({ name: MOCK_PLAYER_NAME }),
			}),
			'string',
			'SHOULD return a string',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	getPlayerDetails()
		GIVEN given a player and a StateService lacking this player
		WHEN called with a Context having this player id as a request path parameter`,
	(test: tape.Test) => {
		test.plan(3);
		const id: Id = 'getPlayerDetailsFailure';
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })(EMPTY_STATE);
		return testedModule
			.getPlayerDetails({
				loggerService,
				stateService,
			})({ request: { params: { id } } } as any)
			.then(handlerResponse => {
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
			});
	},
);

tape(
	`${moduleName}
	getPlayerDetails()
		GIVEN given a player that has no entity nearby
		AND a StateService having this player
		WHEN called with a Context having this player id as a request path parameter`,
	(test: tape.Test) => {
		test.plan(5);
		const id: Id = 'getPlayer';
		const player = createPlayer({
			id,
		});
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [player],
		});
		return testedModule
			.getPlayerDetails({
				loggerService,
				stateService,
			})({ request: { params: { id } } } as any)
			.then(handlerResponse => {
				const body = handlerResponse.json;
				test.equal(
					handlerResponse.status,
					200,
					'SHOULD sucessfully return a 200 response',
				);
				test.deepEqual(
					body.player,
					player,
					'SHOULD sucessfully return a body having the expected player',
				);
				test.deepEqual(
					body.nearby,
					[],
					'SHOULD sucessfully return a body having the expected nearby entities list',
				);
				test.equal(
					typeof body.text,
					'string',
					'SHOULD sucessfully return a body having a descriptive text',
				);
				test.deepEqual(
					body.links,
					[],
					'SHOULD sucessfully return a body having the expected links',
				);
				test.end();
			});
	},
);

tape(
	`${moduleName}
	getPlayerDetails()
		GIVEN a StateService having a player and at least two other entities
		AND that player is near two of them
		WHEN called with a Context having this player id as a request path parameter`,
	(test: tape.Test) => {
		test.plan(5);
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
		return testedModule
			.getPlayerDetails({
				loggerService,
				stateService,
			})({ request: { params: { id } } })
			.then(handlerResponse => {
				const body = handlerResponse.json;
				test.equal(
					handlerResponse.status,
					200,
					'SHOULD sucessfully return a 200 response',
				);
				test.deepEqual(
					body.player,
					player,
					'SHOULD sucessfully return a body with the expected player',
				);
				test.deepEqual(
					body.nearby,
					[nearbyEntity1, nearbyEntity2],
					'SHOULD sucessfully return a body with the expected nearby entities list',
				);
				test.deepEqual(
					body.links,
					[],
					'SHOULD sucessfully return a body with the expected link list',
				);
				test.deepEqual(
					typeof body.text,
					'string',
					'SHOULD sucessfully return a body with a descriptive text',
				);
				test.end();
			});
	},
);
