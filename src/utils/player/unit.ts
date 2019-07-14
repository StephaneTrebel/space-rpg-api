import tape from 'tape';

import { loggerServiceFactory } from '../../services/logger/service';
import { EMPTY_STATE, stateServiceFactory } from '../../services/state/service';

import { EntityType } from '../entity/types';
import { Id } from '../id/types';

import { Player } from './types';

import * as testedModule from './utils';

tape('Player utils', (functions: tape.Test) => {
	functions.test('createPlayer()', (cases: tape.Test) => {
		cases.test('WHEN called without parameters', (test: tape.Test) => {
			test.plan(1);
			const newPlayer = testedModule.createPlayer({});
			test.deepEqual(
				newPlayer,
				{
					boardedIn: null,
					currentPosition: {
						x: 0,
						y: 0,
						z: 0,
					},
					id: newPlayer.id,
					name: 'foo',
					type: EntityType.PLAYER,
				},
				'SHOULD return a Player with mocked values',
			);
		});

		cases.test('WHEN called with parameters', (test: tape.Test) => {
			test.plan(1);
			test.deepEqual(
				testedModule.createPlayer({
					currentPosition: {
						x: 1,
						y: 2,
						z: 3,
					},
					id: 'foo',
					name: 'bar',
				}),
				{
					boardedIn: null,
					currentPosition: {
						x: 1,
						y: 2,
						z: 3,
					},
					id: 'foo',
					name: 'bar',
					type: EntityType.PLAYER,
				},
				'SHOULD return a Player with specified values',
			);
		});
	});

	functions.test('createPlayerMutator()', (cases: tape.Test) => {
		cases.test(
			'WHEN called with a state AND a newPlayer',
			(test: tape.Test) => {
				test.plan(1);
				const newPlayer: Player = testedModule.createPlayer({
					currentPosition: { x: 2, y: 3, z: 4 },
					id: 'bar',
					name: 'foo',
				});
				test.deepEqual(
					testedModule.createPlayerMutator(EMPTY_STATE)(newPlayer),
					{
						...EMPTY_STATE,
						entityList: [newPlayer],
					},
					'SHOULD return a state having this new player',
				);
				test.end();
			},
		);
	});

	functions.test('getPlayerFromStateService()', (cases: tape.Test) => {
		cases.test(
			'WHEN given an player id and a StateService lacking this player',
			(test: tape.Test) => {
				test.plan(1);
				const id: Id = 'bar';
				const player: Player = testedModule.createPlayer({
					id,
				});
				const loggerService = loggerServiceFactory();
				const stateService = stateServiceFactory({ loggerService })({
					...EMPTY_STATE,
					entityList: [player],
				});
				test.throws(
					() =>
						testedModule.getPlayerFromStateService({
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
			'WHEN given an player id and a StateService having this player',
			(test: tape.Test) => {
				test.plan(1);
				const id: Id = 'bar';
				const player: Player = testedModule.createPlayer({
					id,
				});
				const loggerService = loggerServiceFactory();
				const stateService = stateServiceFactory({ loggerService })({
					...EMPTY_STATE,
					entityList: [player],
				});
				test.equal(
					testedModule.getPlayerFromStateService({
						loggerService,
						stateService,
					})({ id }),
					player,
					'SHOULD return the player details',
				);
				test.end();
			},
		);
	});
});
