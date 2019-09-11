import tape from 'tape';

import { loggerServiceFactory } from '../../../services/logger/service';
import {
	stateServiceFactory,
	EMPTY_STATE,
} from '../../../services/state/service';

import * as testedModule from './handler';
import { createSpaceship } from '../../../utils/spaceship/utils';
import { createPlayer } from '../../../utils/player/utils';

const moduleName = 'Player creation handler';

tape(
	`${moduleName}
	addNewPlayer()
		GIVEN a StateService and a LoggerService
		WHEN called with a player name`,
	(test: tape.Test) => {
		test.plan(6);
		const MOCK_NAME = 'addNewPlayer';
		const loggerService = loggerServiceFactory();
		return testedModule
			.addNewPlayer({
				loggerService: loggerServiceFactory(),
				stateService: stateServiceFactory({ loggerService })({
					...EMPTY_STATE,
				}),
			})({ name: MOCK_NAME })
			.then(({ newPlayer, newSpaceship }) => {
				test.equal(
					typeof newPlayer.id,
					'string',
					'SHOULD return an id for the newly created player',
				);
				test.equal(
					newPlayer.name,
					MOCK_NAME,
					'SHOULD return the newly created player name',
				);
				test.equal(
					typeof newSpaceship.id,
					'string',
					'SHOULD return an id for the newly created spaceship',
				);
				test.equal(
					typeof newSpaceship.name,
					'string',
					'SHOULD return a name for the newly created spaceship',
				);
				test.deepEqual(
					newSpaceship.currentPosition,
					{ x: 0, y: 0, z: 0 },
					'SHOULD return the expected position for the newly created spaceship',
				);
				test.deepEqual(
					newSpaceship.onBoard,
					[newPlayer],
					'SHOULD set the newly created player on board their own spaceship',
				);
				test.end();
			});
	},
);

tape(
	`${moduleName}
	getNewPlayerText()
		GIVEN a LoggerService
		WHEN called with a new player and spaceship`,
	(test: tape.Test) => {
		test.plan(1);
		const MOCK_PLAYER_NAME = 'newPlayer';
		const MOCK_SPACESHIP_NAME = 'newSpaceship';
		test.equal(
			typeof testedModule.getNewPlayerText({
				loggerService: loggerServiceFactory(),
			})({
				newPlayer: createPlayer({ name: MOCK_PLAYER_NAME }),
				newSpaceship: createSpaceship({ name: MOCK_SPACESHIP_NAME }),
			}),
			'string',
			'SHOULD return a string',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	addNewPlayerHandler()
		GIVEN a StateService and a LoggerService
		WHEN called with a request object that has a name property in its body`,
	(test: tape.Test) => {
		test.plan(5);
		const MOCK_NAME = 'addNewPlayerHandler';
		const loggerService = loggerServiceFactory();
		return testedModule
			.addNewPlayerHandler({
				loggerService: loggerServiceFactory(),
				stateService: stateServiceFactory({ loggerService })({
					...EMPTY_STATE,
				}),
			})({
				request: { requestBody: { name: MOCK_NAME } },
			} as any)
			.then((handlerResponse: any) => {
				const body = handlerResponse.json;
				test.equal(handlerResponse.status, 201, 'SHOULD return a 201 status');
				test.equal(
					!!body.player,
					true,
					'SHOULD have a truthy player body property',
				);
				test.equal(
					!!body.spaceship,
					true,
					'SHOULD have a truthy spaceship body property',
				);
				test.equal(
					!!body.text,
					true,
					'SHOULD have a truthy text body property',
				);
				test.deepEqual(
					body.links,
					[
						{
							href: '/self-health/ping',
							rel: 'ping',
						},
					],
					'SHOULD return the expected links',
				);
				test.end();
			});
	},
);
