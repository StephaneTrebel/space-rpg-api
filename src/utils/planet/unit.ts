import tape from 'tape';

import { EntityType } from '../entity/types';

import * as testedModule from './utils';

tape('Planet utils', (functions: tape.Test) => {
	functions.test('createPlanet()', (cases: tape.Test) => {
		cases.test('WHEN called without parameters', (test: tape.Test) => {
			test.plan(1);
			test.deepEqual(
				testedModule.createPlanet({}),
				{
					currentPosition: {
						x: 0,
						y: 0,
						z: 0,
					},
					id: 'mockPlanet',
					name: 'foo',
					type: EntityType.PLANET,
				},
				'SHOULD return a Planet with mocked values',
			);
		});

		cases.test('WHEN called with parameters', (test: tape.Test) => {
			test.plan(1);
			test.deepEqual(
				testedModule.createPlanet({
					currentPosition: {
						x: 1,
						y: 2,
						z: 3,
					},
					id: 'foo',
					name: 'bar',
				}),
				{
					currentPosition: {
						x: 1,
						y: 2,
						z: 3,
					},
					id: 'foo',
					name: 'bar',
					type: EntityType.PLANET,
				},
				'SHOULD return a Planet with specified values',
			);
		});
	});
});
