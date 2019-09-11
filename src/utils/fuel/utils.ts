import { State, StateService, StateMutation } from '../../services/state/types';

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

type HasEnoughFuelForOneTick = (entity: FuelableEntity) => boolean;
export const hasEnoughFuelForOneTick: HasEnoughFuelForOneTick = entity =>
	entity.fuel > FUEL_CONSUMPTION;

type ConsumeFuelOnEntity = (deps: {
	stateService: StateService;
}) => (params: { entityId: Id }) => Promise<void>;
export const consumeFuelOnEntity: ConsumeFuelOnEntity = ({ stateService }) => ({
	entityId,
}) =>
	stateService.mutate({
		mutation: StateMutation.CONSUME_FUEL,
		payload: {
			entityId,
		},
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
