import tape from 'tape';

import { createPlayer } from '../player/utils';

import { EntityType } from './types';

import * as testedModule from './utils';

const moduleName = 'Entity utils';

tape(
	`${moduleName}
	createEntity()
		WHEN called with a Mock entity parameters`,
	(test: tape.Test) => {
		test.plan(1);
		test.deepEqual(
			testedModule.createEntity(EntityType.MOCK)({
				currentPosition: { x: 1, y: 2, z: 3 },
				id: 'myNewMockEntity',
				name: 'mock',
			}),
			{
				currentPosition: { x: 1, y: 2, z: 3 },
				id: 'myNewMockEntity',
				name: 'mock',
				type: EntityType.MOCK,
			},
			'SHOULD return a new Mock Entity',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	createEntity()
		WHEN called without an id parameter`,
	(test: tape.Test) => {
		test.plan(1);
		const result = testedModule.createEntity(EntityType.MOCK)({});
		test.deepEqual(
			typeof result.id,
			'string',
			'SHOULD return an entity with a string id',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	createEntity()
		WHEN called with a Planet entity parameters`,
	(test: tape.Test) => {
		test.plan(1);
		test.deepEqual(
			testedModule.createEntity(EntityType.PLANET)({
				currentPosition: { x: 1, y: 2, z: 3 },
				id: 'myNewPlanetEntity',
				name: 'toto',
			}),
			{
				currentPosition: { x: 1, y: 2, z: 3 },
				id: 'myNewPlanetEntity',
				name: 'toto',
				type: EntityType.PLANET,
			},
			'SHOULD return a new Planet Entity',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	createEntity()
		WHEN called with a Player entity parameters`,
	(test: tape.Test) => {
		test.plan(1);
		test.deepEqual(
			testedModule.createEntity(EntityType.PLAYER)({
				currentPosition: { x: 1, y: 2, z: 3 },
				id: 'myNewPlayerEntity',
				name: 'toto',
			}),
			{
				boardedIn: null,
				currentPosition: { x: 1, y: 2, z: 3 },
				id: 'myNewPlayerEntity',
				name: 'toto',
				type: EntityType.PLAYER,
			},
			'SHOULD return a new Player Entity',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	createEntity()
		WHEN called with a Spaceship entity parameters`,
	(test: tape.Test) => {
		test.plan(1);
		const player = createPlayer({});
		test.deepEqual(
			testedModule.createEntity(EntityType.SPACESHIP)({
				currentPosition: { x: 1, y: 2, z: 3 },
				fuel: 123,
				id: 'myNewSpaceshipEntity',
				name: 'toto',
				onBoard: [player],
			}),
			{
				currentPosition: { x: 1, y: 2, z: 3 },
				fuel: 123,
				id: 'myNewSpaceshipEntity',
				name: 'toto',
				onBoard: [player],
				type: EntityType.SPACESHIP,
			},
			'SHOULD return a new Spaceship Entity',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	getEntityDetailsText()
		WHEN called with a entity of type MOCK`,
	(test: tape.Test) => {
		test.plan(1);
		const entity = testedModule.createEntity(EntityType.MOCK)({
			id: 'getEntityDetailsTextMOCK',
		});
		test.equal(
			typeof testedModule.getEntityDetailsText({ entity }),
			'string',
			'SHOULD return a string',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	getEntityDetailsText()
		WHEN called with a entity of type PLANET`,
	(test: tape.Test) => {
		test.plan(2);
		const entity = testedModule.createEntity(EntityType.PLANET)({
			id: 'getEntityDetailsTextPLANET',
		});
		test.equal(
			typeof testedModule.getEntityDetailsText({ entity }),
			'string',
			'SHOULD return a string',
		);
		test.equal(
			testedModule.getEntityDetailsText({ entity }) !==
				testedModule.getEntityDetailsText({
					entity: testedModule.createEntity(EntityType.MOCK)({}),
				}),
			true,
			'SHOULD return a different string than the one for a MOCK entity',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	getEntityDetailsText()
		WHEN called with a entity of type PLAYER`,
	(test: tape.Test) => {
		test.plan(3);
		const entity = testedModule.createEntity(EntityType.PLAYER)({
			id: 'getEntityDetailsTextPLAYER',
		});
		test.equal(
			typeof testedModule.getEntityDetailsText({ entity }),
			'string',
			'SHOULD return a string',
		);
		test.equal(
			testedModule.getEntityDetailsText({ entity }) !==
				testedModule.getEntityDetailsText({
					entity: testedModule.createEntity(EntityType.MOCK)({}),
				}),
			true,
			'SHOULD return a different string than the one for a MOCK entity',
		);
		test.equal(
			testedModule.getEntityDetailsText({ entity }) !==
				testedModule.getEntityDetailsText({
					entity: testedModule.createEntity(EntityType.PLANET)({}),
				}),
			true,
			'SHOULD return a different string than the one for a PLANET entity',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	getEntityDetailsText()
		WHEN called with a entity of type SPACESHIP`,
	(test: tape.Test) => {
		test.plan(4);
		const entity = testedModule.createEntity(EntityType.SPACESHIP)({
			id: 'getEntityDetailsTextSPACESHIP',
		});
		test.equal(
			typeof testedModule.getEntityDetailsText({ entity }),
			'string',
			'SHOULD return a string',
		);
		test.equal(
			testedModule.getEntityDetailsText({ entity }) !==
				testedModule.getEntityDetailsText({
					entity: testedModule.createEntity(EntityType.MOCK)({}),
				}),
			true,
			'SHOULD return a different string than the one for a MOCK entity',
		);
		test.equal(
			testedModule.getEntityDetailsText({ entity }) !==
				testedModule.getEntityDetailsText({
					entity: testedModule.createEntity(EntityType.PLANET)({}),
				}),
			true,
			'SHOULD return a different string than the one for a PLANET entity',
		);
		test.equal(
			testedModule.getEntityDetailsText({ entity }) !==
				testedModule.getEntityDetailsText({
					entity: testedModule.createEntity(EntityType.PLAYER)({}),
				}),
			true,
			'SHOULD return a different string than the one for a PLAYER entity',
		);
		test.end();
	},
);
