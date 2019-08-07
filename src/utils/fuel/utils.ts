import { State } from '../../services/state/types';

import { Entity, EntityType } from '../entity/types';
import { Id } from '../id/types';

import { FuelableEntity } from './types';

export const isEntityFuelable = (entity: Entity): entity is FuelableEntity =>
	entity.type === EntityType.SPACESHIP;

export const FUEL_CONSUMPTION = 1;
export const consumeFuelMutator = (currentState: State) => ({
	entityId,
}: {
	entityId: Id;
}): State => ({
	...currentState,
	entityList: currentState.entityList.map(entity =>
		entity.id === entityId && isEntityFuelable(entity)
			? {
					...entity,
					fuel:
						entity.fuel >= FUEL_CONSUMPTION
							? entity.fuel - FUEL_CONSUMPTION
							: 0,
			  }
			: entity,
	),
});

export const MAX_FUEL = 1000;
export const refuelEntityMutator = (currentState: State) => ({
	entityId,
}: {
	entityId: Id;
}): State => ({
	...currentState,
	entityList: currentState.entityList.map(entity =>
		entity.id === entityId && isEntityFuelable(entity)
			? {
					...entity,
					fuel: MAX_FUEL,
			  }
			: entity,
	),
});
