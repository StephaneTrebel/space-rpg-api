import tape from 'tape';

import { loggerServiceFactory } from '../../services/logger/service';
import { stateServiceFactory, EMPTY_STATE } from '../../services/state/service';

import { Id } from '../id/types';
import { createPlayer } from '../player/utils';

import { Position } from './types';

import * as testedModule from './utils';

tape('Position utils', (functions: tape.Test) => {
	functions.test('movePosition()', (when: tape.Test) => {
		when.test(
			`WHEN called with a point in space
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
			`WHEN called with a point in space
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
			`WHEN called with a point in space
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
			`WHEN called with a point in space
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

	functions.test('isSamePosition()', (when: tape.Test) => {
		when.test('WHEN called with two different positions', (test: tape.Test) => {
			test.plan(1);
			test.equal(
				testedModule.isSamePosition({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 }),
				false,
				'SHOULD return false',
			);
			test.end();
		});

		when.test('WHEN called with two identical positions', (test: tape.Test) => {
			test.plan(1);
			test.equal(
				testedModule.isSamePosition({ x: 4, y: 5, z: 6 }, { x: 4, y: 5, z: 6 }),
				true,
				'SHOULD return true',
			);
			test.end();
		});
	});
	functions.test('getEntityCurrentPosition()', (when: tape.Test) => {
		when.test(
			`WHEN called with an entity
    AND a State having this entity`,
			(test: tape.Test) => {
				test.plan(1);
				const id: Id = 'getEntityCurrentPosition';
				const currentPosition: Position = {
					x: 124,
					y: 456,
					z: 789,
				};
				const entity = createPlayer({
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
});
