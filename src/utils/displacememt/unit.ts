import tape from 'tape';

import {
	configServiceFactory,
	DEFAULT_CONFIG,
} from '../../services/config/service';
import { loggerServiceFactory } from '../../services/logger/service';
import { stateServiceFactory, EMPTY_STATE } from '../../services/state/service';
import { State } from '../../services/state/types';
import { timeServiceFactory } from '../../services/time/service';
import { ActionType } from '../../services/time/types';

import { Displacement } from '../displacememt/types';
import { EntityType } from '../entity/types';
import { createEntity } from '../entity/utils';
import { Id } from '../id/types';
import { createPlanet } from '../planet/utils';
import { createPlayer } from '../player/utils';
import { Position } from '../position/types';
import { Spaceship } from '../spaceship/types';
import { createSpaceship } from '../spaceship/utils';

import * as testedModule from './utils';

const moduleName = 'Displacement utils';

tape(
	`${moduleName}
	createDisplacementMock()
		WHEN called with no parameters`,
	(test: tape.Test) => {
		test.plan(4);
		const displacement = testedModule.createDisplacementMock({});
		test.equal(
			displacement.type,
			ActionType.DISPLACEMENT,
			'SHOULD return an object that is an action of type DISPLACEMENT',
		);
		test.equal(
			typeof displacement.id,
			'string',
			'SHOULD return an object that has an id',
		);
		test.equal(
			typeof displacement.executor,
			'function',
			'SHOULD return an object that has an executor function',
		);
		return displacement.executor({} as any).then(() => {
			test.pass(
				'SHOULD return an object which executor function returns a Promise',
			);
		});
	},
);

tape(
	`${moduleName}
	createExecutor()
		GIVEN a displaceable entity having two boarded entities
		WHEN called with the displaceable entity id
		AND a displacement id
		AND a position that is not reachable by the entity in a single tick`,
	(test: tape.Test) => {
		test.plan(6);
		const displacementId: Id = 'foo';
		const entityId: Id = 'bar';
		const boardedEntityAId: Id = 'baz';
		const boardedEntityBId: Id = 'qux';
		const boardedEntityA = createPlayer({ id: boardedEntityAId });
		const boardedEntityB = createPlayer({ id: boardedEntityBId });
		const entity = createSpaceship({
			currentPosition: { x: 0, y: 0, z: 0 },
			fuel: 234,
			id: entityId,
			onBoard: [boardedEntityA, boardedEntityB],
		});
		const targetCoordinates: Position = { x: 999, y: 999, z: 999 };
		const configService = configServiceFactory(DEFAULT_CONFIG);
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [entity, boardedEntityA, boardedEntityB],
		});
		const timeService = timeServiceFactory({
			configService,
			loggerService,
			stateService,
		})();
		return testedModule
			.createExecutor({
				displacementId,
				entityId,
				targetCoordinates,
			})({
				loggerService,
				stateService,
				timeService,
			})
			.then(() => {
				test.pass('SHOULD return a function that returns a Promise');
				const resultEntity = stateService.findEntityById({
					id: entityId,
				}) as Spaceship;
				test.deepEqual(
					resultEntity.currentPosition,
					{
						x: 0.5773502691896257,
						y: 0.5773502691896257,
						z: 0.5773502691896257,
					},
					'SHOULD update entity position',
				);
				const resultBoardedEntityA = stateService.findEntityById({
					id: boardedEntityAId,
				}) as Spaceship;
				test.deepEqual(
					resultBoardedEntityA.currentPosition,
					{
						x: 0.5773502691896257,
						y: 0.5773502691896257,
						z: 0.5773502691896257,
					},
					'SHOULD update the first boarded entity position',
				);
				const resultBoardedEntityB = stateService.findEntityById({
					id: boardedEntityBId,
				}) as Spaceship;
				test.deepEqual(
					resultBoardedEntityB.currentPosition,
					{
						x: 0.5773502691896257,
						y: 0.5773502691896257,
						z: 0.5773502691896257,
					},
					'SHOULD update the second boarded entity position',
				);
				test.deepEqual(resultEntity.fuel, 233, 'SHOULD update entity fuel');
				const resultDisplacement = timeService.findAction(displacementId);
				test.deepEqual(
					!!resultDisplacement,
					true,
					'SHOULD add another displacement in Time service',
				);
			});
	},
);

tape(
	`${moduleName}
	createExecutor()
		GIVEN a displaceable entity having two boarded entities
		WHEN called with the displaceable entity id
		AND a displacement id
		AND a position that is reachable by the entity in a single tick
		AND there is no planet at this position`,
	(test: tape.Test) => {
		test.plan(4);
		const displacementId: Id = 'foo';
		const entityId: Id = 'bar';
		const entity = createSpaceship({
			currentPosition: { x: 0, y: 0, z: 0 },
			fuel: 234,
			id: entityId,
			onBoard: [],
		});
		const targetCoordinates: Position = { x: 0.1, y: 0.1, z: 0.1 };
		const configService = configServiceFactory(DEFAULT_CONFIG);
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [entity],
		});
		const timeService = timeServiceFactory({
			configService,
			loggerService,
			stateService,
		})();
		return testedModule
			.createExecutor({
				displacementId,
				entityId,
				targetCoordinates,
			})({
				loggerService,
				stateService,
				timeService,
			})
			.then(() => {
				test.pass('SHOULD return a function that returns a Promise');
				const resultEntity = stateService.findEntityById({
					id: entityId,
				}) as Spaceship;
				test.deepEqual(
					resultEntity.currentPosition,
					{
						x: 0.1,
						y: 0.1,
						z: 0.1,
					},
					'SHOULD set entity position to the target coordinates',
				);
				test.deepEqual(resultEntity.fuel, 233, 'SHOULD update entity fuel');
				const resultDisplacement = timeService.findAction(displacementId);
				test.deepEqual(
					resultDisplacement,
					undefined,
					'SHOULD not add another displacement in Time service',
				);
			});
	},
);

tape(
	`${moduleName}
	createExecutor()
		GIVEN a displaceable entity
		WHEN called with the displaceable entity id
		AND a displacement id
		AND a position that is reachable by the entity in a single tick
		AND there is a planet at this position`,
	(test: tape.Test) => {
		test.plan(4);
		const displacementId: Id = 'foo';
		const entityId: Id = 'bar';
		const entity = createSpaceship({
			currentPosition: { x: 0, y: 0, z: 0 },
			fuel: 234,
			id: entityId,
			onBoard: [],
		});
		const targetCoordinates: Position = { x: 0.1, y: 0.1, z: 0.1 };
		const configService = configServiceFactory(DEFAULT_CONFIG);
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [
				entity,
				createPlanet({ currentPosition: targetCoordinates, id: 'any-planet' }),
			],
		});
		const timeService = timeServiceFactory({
			configService,
			loggerService,
			stateService,
		})();
		return testedModule
			.createExecutor({
				displacementId,
				entityId,
				targetCoordinates,
			})({
				loggerService,
				stateService,
				timeService,
			})
			.then(() => {
				test.pass('SHOULD return a function that returns a Promise');
				const resultEntity = stateService.findEntityById({
					id: entityId,
				}) as Spaceship;
				test.deepEqual(
					resultEntity.currentPosition,
					{
						x: 0.1,
						y: 0.1,
						z: 0.1,
					},
					'SHOULD set entity position to the target coordinates',
				);
				test.deepEqual(resultEntity.fuel, 1000, 'SHOULD refuel entity');
				const resultDisplacement = timeService.findAction(displacementId);
				test.deepEqual(
					resultDisplacement,
					undefined,
					'SHOULD not add another displacement in Time service',
				);
			});
	},
);

tape(
	`${moduleName}
	createExecutor()
		GIVEN a displaceable entity that has not enough fuel for even one tick
		WHEN called with the displaceable entity id
		AND a displacement id
		AND any position`,
	(test: tape.Test) => {
		test.plan(4);
		const displacementId: Id = 'foo';
		const entityId: Id = 'bar';
		const entity = createSpaceship({
			currentPosition: { x: 0, y: 0, z: 0 },
			fuel: 0,
			id: entityId,
			onBoard: [],
		});
		const targetCoordinates: Position = { x: 100, y: 100, z: 100 };
		const configService = configServiceFactory(DEFAULT_CONFIG);
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [
				entity,
				createPlanet({ currentPosition: targetCoordinates, id: 'any-planet' }),
			],
		});
		const timeService = timeServiceFactory({
			configService,
			loggerService,
			stateService,
		})();
		return testedModule
			.createExecutor({
				displacementId,
				entityId,
				targetCoordinates,
			})({
				loggerService,
				stateService,
				timeService,
			})
			.then(() => {
				test.pass('SHOULD return a function that returns a Promise');
				const resultEntity = stateService.findEntityById({
					id: entityId,
				}) as Spaceship;
				test.deepEqual(
					resultEntity.currentPosition,
					{
						x: 0,
						y: 0,
						z: 0,
					},
					'SHOULD not change entity position',
				);
				test.deepEqual(
					resultEntity.fuel,
					0,
					'SHOULD left the entity fuel untouched',
				);
				const resultDisplacement = timeService.findAction(displacementId);
				test.deepEqual(
					resultDisplacement,
					undefined,
					'SHOULD not add another displacement in Time service',
				);
			});
	},
);

tape(
	`${moduleName}
	createDisplacement()
		GIVEN an unknown entity
    WHEN called with this entity id`,
	(test: tape.Test) => {
		test.plan(1);
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [],
		});
		const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
		test.throws(
			() =>
				testedModule.createDisplacement({
					loggerService,
					stateService,
				})({
					entityId: 'unknown',
					target: targetCoordinates,
				}),
			'SHOULD throw an error',
		);
	},
);

tape(
	`${moduleName}
	createDisplacement()
		GIVEN an undisplaceable entity
    WHEN called with this entity id and target coordinates`,
	(test: tape.Test) => {
		test.plan(1);
		const entityId: Id = 'foo';
		const currentPosition: Position = { x: 0, y: 0, z: 0 };
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [
				createEntity(EntityType.MOCK)({
					currentPosition,
					id: entityId,
				}),
			],
		});
		const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
		test.throws(
			() =>
				testedModule.createDisplacement({
					loggerService,
					stateService,
				})({
					entityId,
					target: targetCoordinates,
				}),
			'SHOULD throw an error',
		);
	},
);

tape(
	`${moduleName}
	createDisplacement()
		GIVEN a displaceable entity that is located at its target coordinates
    WHEN called with this entity id and target coordinates`,
	(test: tape.Test) => {
		test.plan(3);
		const entityId: Id = 'foo';
		const currentPosition: Position = { x: 0, y: 0, z: 0 };
		const configService = configServiceFactory(DEFAULT_CONFIG);
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [
				createSpaceship({
					currentPosition,
					id: entityId,
				}),
			],
		});
		const timeService = timeServiceFactory({
			configService,
			loggerService,
			stateService,
		})();
		const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
		const maybeDisplacement: Displacement = testedModule.createDisplacement({
			loggerService,
			stateService,
		})({
			entityId,
			target: targetCoordinates,
		});
		test.equal(
			!!maybeDisplacement &&
				typeof maybeDisplacement.executor === 'function' &&
				typeof maybeDisplacement.id === 'string' &&
				maybeDisplacement.targetCoordinates === targetCoordinates &&
				maybeDisplacement.type === ActionType.DISPLACEMENT,
			true,
			'SHOULD return a Displacement object',
		);
		return maybeDisplacement
			.executor({
				loggerService,
				stateService,
				timeService,
			})
			.then(() => {
				test.pass(
					`AND this object SHOULD have an executor method that returns a Promise`,
				);
				test.equal(
					timeService.findAction(maybeDisplacement.id),
					undefined,
					`AND there should be no additionnal displacement planned`,
				);
			});
	},
);

tape(
	`${moduleName}
	createDisplacement()
		GIVEN a displaceable entity that is not located at its target coordinates
    WHEN called with this entity id and target coordinates`,
	(test: tape.Test) => {
		test.plan(3);
		const entityId: Id = 'foo';
		const currentPosition: Position = { x: 0, y: 0, z: 0 };
		const configService = configServiceFactory(DEFAULT_CONFIG);
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [
				createSpaceship({
					currentPosition,
					id: entityId,
					onBoard: [createPlayer({})],
				}),
			],
		});
		const timeService = timeServiceFactory({
			configService,
			loggerService,
			stateService,
		})();
		const targetCoordinates: Position = { x: 10, y: 10, z: 10 };
		const maybeDisplacement: Displacement = testedModule.createDisplacement({
			loggerService,
			stateService,
		})({
			entityId,
			target: targetCoordinates,
		});
		test.equal(
			!!maybeDisplacement &&
				typeof maybeDisplacement.executor === 'function' &&
				typeof maybeDisplacement.id === 'string' &&
				maybeDisplacement.targetCoordinates === targetCoordinates &&
				maybeDisplacement.type === ActionType.DISPLACEMENT,
			true,
			'SHOULD return a Displacement object',
		);
		return maybeDisplacement
			.executor({
				loggerService,
				stateService,
				timeService,
			})
			.then(() => {
				test.pass(
					`AND this object SHOULD have an executor method that returns a Promise`,
				);
				const action = timeService.findAction(maybeDisplacement.id);
				test.equal(
					action && action.id,
					maybeDisplacement.id,
					`AND there should be an additionnal displacement planned`,
				);
			});
	},
);

tape(
	`${moduleName}
		displaceEntityMutator()
			WHEN called with a state AND a displacement payload`,
	(test: tape.Test) => {
		test.plan(1);
		const entityId: Id = 'foo';
		const entityA = createEntity(EntityType.PLANET)({
			id: entityId + 'A',
		});
		const entityB = createEntity(EntityType.PLANET)({ id: entityId });
		const entityC = createEntity(EntityType.PLANET)({
			id: entityId + 'C',
		});
		const initalState: State = {
			...EMPTY_STATE,
			entityList: [entityA, entityB, entityC],
		};
		const newPosition: Position = { x: 1, y: 2, z: 3 };
		test.deepEqual(
			testedModule.displaceEntityMutator(initalState)({
				entityId,
				newPosition,
			}),
			{
				...initalState,
				entityList: [
					entityA,
					{ ...entityB, currentPosition: newPosition },
					entityC,
				],
			},
			'SHOULD return an appropriately mutated state',
		);
	},
);
