import tape from 'tape';

import { EMPTY_STATE } from '../../services/state/service';
import { State } from '../../services/state/types';

import { Id } from '../id/types';
import { createPlanet } from '../planet/utils';
import { createSpaceship } from '../spaceship/utils';

import * as testedModule from './utils';

const moduleName = 'Fuel utils';

tape(
	`${moduleName}
	isEntityFuelable()
		WHEN called with a non fuel-able entity`,
	(test: tape.Test) => {
		test.plan(1);
		test.deepEqual(
			testedModule.isEntityFuelable(createPlanet({})),
			false,
			'SHOULD return false',
		);
	},
);

tape(
	`${moduleName}
	isEntityFuelable()
		WHEN called with a fuel-able entity`,
	(test: tape.Test) => {
		test.plan(1);
		test.deepEqual(
			testedModule.isEntityFuelable(createSpaceship({})),
			true,
			'SHOULD return true',
		);
	},
);

tape(
	`${moduleName}
	consumeFuelMutator()
		GIVEN a state that has a non fuel-able entity
		WHEN called with this state AND that entity id`,
	(test: tape.Test) => {
		test.plan(1);
		const entityId: Id = 'foo';
		const entityA = createPlanet({
			fuel: 345,
			id: entityId,
		} as any);
		const initalState: State = {
			...EMPTY_STATE,
			entityList: [entityA],
		};
		test.deepEqual(
			testedModule.consumeFuelMutator(initalState)({
				entityId,
			}),
			{
				...initalState,
				entityList: [entityA],
			},
			'SHOULD return a state with the same, untouched, entity',
		);
	},
);

tape(
	`${moduleName}
	consumeFuelMutator()
		GIVEN a state that has a fuel-able entity that does not have enough fuel
		WHEN called with this state AND that entity id`,
	(test: tape.Test) => {
		test.plan(1);
		const entityId: Id = 'foo';
		const entityA = createSpaceship({
			fuel: testedModule.FUEL_CONSUMPTION / 2,
			id: entityId,
		});
		const initalState: State = {
			...EMPTY_STATE,
			entityList: [entityA],
		};
		test.deepEqual(
			testedModule.consumeFuelMutator(initalState)({
				entityId,
			}),
			{
				...initalState,
				entityList: [{ ...entityA, fuel: 0 }],
			},
			'SHOULD return a state in which entity has had its fuel set to 0',
		);
	},
);

tape(
	`${moduleName}
	consumeFuelMutator()
		GIVEN a state that has a fuel-able entity that has enough fuel
		WHEN called with this state AND that entity id`,
	(test: tape.Test) => {
		test.plan(1);
		const entityId: Id = 'foo';
		const entityA = createSpaceship({
			fuel: 345,
			id: entityId,
		});
		const initalState: State = {
			...EMPTY_STATE,
			entityList: [entityA],
		};
		test.deepEqual(
			testedModule.consumeFuelMutator(initalState)({
				entityId,
			}),
			{
				...initalState,
				entityList: [{ ...entityA, fuel: 344 }],
			},
			'SHOULD return a state in which entity has had its fuel diminished',
		);
	},
);

tape(
	`${moduleName}
	hasEnoughFuelForOneTick()
		GIVEN a fuel-able entity that has not enough fuel for one tick
		WHEN called with this entity`,
	(test: tape.Test) => {
		test.plan(1);
		test.deepEqual(
			testedModule.hasEnoughFuelForOneTick(
				createSpaceship({
					fuel: testedModule.FUEL_CONSUMPTION - 1,
				}),
			),
			false,
			'SHOULD return false',
		);
	},
);

tape(
	`${moduleName}
	hasEnoughFuelForOneTick()
		GIVEN a fuel-able entity that has enough fuel for one tick
		WHEN called with this entity`,
	(test: tape.Test) => {
		test.plan(1);
		test.deepEqual(
			testedModule.hasEnoughFuelForOneTick(
				createSpaceship({
					fuel: testedModule.FUEL_CONSUMPTION + 1,
				}),
			),
			true,
			'SHOULD return true',
		);
	},
);

tape(
	`${moduleName}
	consumeFuelOnEntity()
		GIVEN an entity
		WHEN called with a State service and this entity`,
	(test: tape.Test) => {
		test.plan(2);
		testedModule
			.consumeFuelOnEntity({
				stateService: {
					mutate: () =>
						Promise.resolve(
							test.pass('SHOULD request a State update for this entity'),
						),
				},
			} as any)({
				entityId: 'foo',
			})
			.then(() => test.pass('SHOULD return a Promise'));
	},
);

tape(
	`${moduleName}
	refuelEntityMutator()
		GIVEN a state that has a non fuel-able entity
		WHEN called with this state AND that entity id`,
	(test: tape.Test) => {
		test.plan(1);
		const entityId: Id = 'foo';
		const entityA = createPlanet({
			id: entityId,
		});
		const initalState: State = {
			...EMPTY_STATE,
			entityList: [entityA],
		};
		test.deepEqual(
			testedModule.refuelEntityMutator(initalState)({
				entityId,
			}),
			{
				...initalState,
				entityList: [entityA],
			},
			'SHOULD return a state in which entity is untouched',
		);
	},
);

tape(
	`${moduleName}
	refuelEntityMutator()
		GIVEN a state that has a fuel-able entity
		WHEN called with this state AND that entity id`,
	(test: tape.Test) => {
		test.plan(1);
		const entityId: Id = 'foo';
		const entityA = createSpaceship({
			fuel: 1,
			id: entityId,
		});
		const initalState: State = {
			...EMPTY_STATE,
			entityList: [entityA],
		};
		test.deepEqual(
			testedModule.refuelEntityMutator(initalState)({
				entityId,
			}),
			{
				...initalState,
				entityList: [{ ...entityA, fuel: testedModule.MAX_FUEL }],
			},
			'SHOULD return a state in which entity has had its fuel replenished',
		);
	},
);
