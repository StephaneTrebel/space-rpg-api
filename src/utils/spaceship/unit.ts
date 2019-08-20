import tape from 'tape';

import { loggerServiceFactory } from '../../services/logger/service';
import { EMPTY_STATE, stateServiceFactory } from '../../services/state/service';

import { EntityType } from '../entity/types';
import { Id } from '../id/types';
import { createPlanet } from '../planet/utils';
import { PlayerCarryingEntity } from '../player/types';
import { createPlayer } from '../player/utils';

import * as testedModule from './utils';

const moduleName = 'Spaceship utils';

tape(
	`${moduleName}
	createSpaceship()
		WHEN called without parameters`,
	(test: tape.Test) => {
		test.plan(1);
		const newSpaceship = testedModule.createSpaceship({});
		test.deepEqual(
			newSpaceship,
			{
				currentPosition: {
					x: 0,
					y: 0,
					z: 0,
				},
				fuel: 1000,
				id: newSpaceship.id,
				name: 'unknown',
				onBoard: [],
				type: EntityType.SPACESHIP,
			},
			'SHOULD return a Spaceship with mocked values',
		);
	},
);

tape(
	`${moduleName}
	createSpaceship()
		WHEN called with parameters`,
	(test: tape.Test) => {
		test.plan(1);
		test.deepEqual(
			testedModule.createSpaceship({
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
				fuel: 1000,
				id: 'foo',
				name: 'bar',
				onBoard: [],
				type: EntityType.SPACESHIP,
			},
			'SHOULD return a Spaceship with specified values',
		);
	},
);

tape(
	`${moduleName}
	createSpaceshipMutator()
		WHEN called with a state AND a spaceship`,
	(test: tape.Test) => {
		test.plan(1);
		const spaceship = testedModule.createSpaceship({
			currentPosition: { x: 2, y: 3, z: 4 },
			fuel: 123,
			id: 'bar',
			name: 'foo',
		});
		test.deepEqual(
			testedModule.createSpaceshipMutator(EMPTY_STATE)(spaceship),
			{
				...EMPTY_STATE,
				entityList: [spaceship],
			},
			'SHOULD return a state having this new spaceship',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	isEntityASpaceship()
		WHEN called with a Player entity`,
	(test: tape.Test) => {
		test.plan(1);
		test.equal(
			testedModule.isEntityASpaceship(createPlayer({})),
			false,
			'SHOULD return false',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	isEntityASpaceship()
		WHEN called with a Planet entity`,
	(test: tape.Test) => {
		test.plan(1);
		test.equal(
			testedModule.isEntityASpaceship(createPlanet({})),
			false,
			'SHOULD return false',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	isEntityASpaceship()
		WHEN called with a Spaceship entity`,
	(test: tape.Test) => {
		test.plan(1);
		test.equal(
			testedModule.isEntityASpaceship(testedModule.createSpaceship({})),
			true,
			'SHOULD return true',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	getSpaceshipFromStateService()
		GIVEN a boardable entity and a StateService lacking this entity
		WHEN called with this StateService and this entity id`,
	(test: tape.Test) => {
		test.plan(1);
		const id: Id = 'bar';
		const spaceship = testedModule.createSpaceship({
			id,
		});
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [spaceship],
		});
		test.throws(
			() =>
				testedModule.getSpaceshipFromStateService({
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

tape(
	`${moduleName}
	getSpaceshipFromStateService()
		GIVEN a boardable entity and a StateService having this entity
		WHEN called with this StateService and this entity id`,
	(test: tape.Test) => {
		test.plan(1);
		const id: Id = 'bar';
		const spaceship = testedModule.createSpaceship({
			id,
		});
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [spaceship],
		});
		test.equal(
			testedModule.getSpaceshipFromStateService({
				loggerService,
				stateService,
			})({ id }),
			spaceship,
			'SHOULD return the spaceship details',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	getSpaceshipFromStateService()
		GIVEN a non-boardable entity and a StateService having this entity
		WHEN called with this StateService and this entity id`,
	(test: tape.Test) => {
		test.plan(1);
		const id: Id = 'bar';
		const planet = createPlanet({
			id,
		});
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [planet],
		});
		test.throws(
			() =>
				testedModule.getSpaceshipFromStateService({
					loggerService,
					stateService,
				})({ id }),
			'SHOULD throw an error',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	getBoardedEntities()
		GIVEN a non-boardable entity and a StateService having this entity
		WHEN called with this StateService and this entity id`,
	(test: tape.Test) => {
		test.plan(1);
		const id: Id = 'bar';
		const entity = createPlayer({
			id,
		});
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [entity],
		});
		test.deepEqual(
			testedModule.getBoardedEntities({
				loggerService,
				stateService,
			})({ id }),
			[],
			'SHOULD return an empty list',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	getBoardedEntities()
		GIVEN a boardable entity and a StateService having this entity
		WHEN called with this StateService and this entity id`,
	(test: tape.Test) => {
		test.plan(1);
		const id: Id = 'bar';
		const boardedList = [createPlayer({}), createPlayer({})];
		const spaceship = testedModule.createSpaceship({
			id,
			onBoard: boardedList,
		});
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [spaceship],
		});
		test.equal(
			testedModule.getBoardedEntities({
				loggerService,
				stateService,
			})({ id }),
			boardedList,
			'SHOULD return the entities list currently on board the spaceship',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	hasBoarded()
		GIVEN a spaceship and a player not already on this spaceship
		WHEN called with this spaceship and this player`,
	(test: tape.Test) => {
		test.plan(1);
		const player = createPlayer({});
		const spaceship = testedModule.createSpaceship({
			onBoard: [],
		});
		test.equal(
			testedModule.hasBoarded(spaceship)(player),
			false,
			'SHOULD return false',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	hasBoarded()
		GIVEN a spaceship and a player already on this spaceship
		WHEN called with this spaceship and this player`,
	(test: tape.Test) => {
		test.plan(1);
		const player = createPlayer({ id: 'foo' });
		const spaceship = testedModule.createSpaceship({
			onBoard: [player],
		});
		test.deepEqual(
			testedModule.hasBoarded(spaceship)(player),
			true,
			'SHOULD return true',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	boardSpaceship()
		GIVEN a spaceship and a player already on this spaceship
		WHEN called with this spaceship and this entity`,
	(test: tape.Test) => {
		test.plan(1);
		const player = createPlayer({ id: 'foo' });
		const spaceship = testedModule.createSpaceship({
			onBoard: [player],
		});
		test.throws(
			() => testedModule.boardSpaceship(spaceship)(player),
			'SHOULD throw an error',
		);
		test.end();
	},
);

tape(
	`${moduleName}
	boardSpaceship()
		GIVEN a spaceship and a player not already on this spaceship
		WHEN called with this spaceship and this entity`,
	(test: tape.Test) => {
		test.plan(3);
		const playerA = createPlayer({ id: 'foo' });
		const playerB = createPlayer({ id: 'bar' });
		const playerC = createPlayer({ id: 'qux' });
		const spaceship = testedModule.createSpaceship({
			onBoard: [playerA, playerB],
		});
		const couple = testedModule.boardSpaceship(spaceship)(playerC);
		test.deepEqual(
			couple.spaceship.onBoard,
			[playerA, playerB, playerC],
			'SHOULD return an object having a spaceship property that has the player added to its onboard list',
		);
		test.equal(
			couple.entity.id,
			playerC.id,
			'SHOULD return an object having an entity property that has the same id as the player',
		);
		test.equal(
			(couple.entity.boardedIn as PlayerCarryingEntity).id,
			spaceship.id,
			'SHOULD return an object having an entity property that is boarded in the spaceship',
		);
		test.end();
	},
);
