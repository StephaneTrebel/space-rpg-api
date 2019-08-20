import { LoggerService } from '../../services/logger/types';
import { State, StateService } from '../../services/state/types';

import { EntityType } from '../../utils/entity/types';
import { createEntity } from '../entity/utils';
import { Position } from '../position/types';
import { Id } from '../../utils/id/types';
import {
	BoardableEntity,
	BoardableEntityList,
	Spaceship,
} from '../../utils/spaceship/types';
import { Entity } from '../entity/types';

export const createSpaceship = (params: {
	currentPosition?: Position;
	fuel?: number;
	id?: Id;
	name?: string;
	onBoard?: BoardableEntityList;
}): Spaceship => createEntity(EntityType.SPACESHIP)(params) as Spaceship;

export const createSpaceshipMutator = (currentState: State) => (
	newSpaceship: Spaceship,
): State => ({
	...currentState,
	entityList: [...currentState.entityList, newSpaceship],
});

export const isEntityASpaceship = (entity: Entity): entity is Spaceship =>
	entity.type === EntityType.SPACESHIP;

type GetSpaceshipFromStateService = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => (params: { id: Id }) => Spaceship;
export const getSpaceshipFromStateService: GetSpaceshipFromStateService = ({
	loggerService,
	stateService,
}) => ({ id }) => {
	loggerService.debug('Entering getSpaceshipFromStateService…');
	const entity = stateService.findEntityById({
		id,
	});
	if (isEntityASpaceship(entity)) {
		loggerService.debug(
			`Spaceship retrieved for id '${id}': ${JSON.stringify(entity)}`,
		);
		return entity;
	}
	throw new Error(
		`Expected entity with id '${id}' to be a spaceship, but it is a '${
			entity.type
		}'`,
	);
};

type GetBoardedEntities = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => (params: { id: Id }) => BoardableEntityList;
export const getBoardedEntities: GetBoardedEntities = ({
	loggerService,
	stateService,
}) => ({ id }) => {
	loggerService.debug('Entering getBoardedEntities…');
	try {
		return getSpaceshipFromStateService({ loggerService, stateService })({ id })
			.onBoard;
	} catch (error) {
		loggerService.warning(error.message);
		return [];
	}
};

type HasBoarded = (
	spaceship: Spaceship,
) => (entity: BoardableEntity) => boolean;
export const hasBoarded: HasBoarded = spaceship => entity =>
	!!spaceship.onBoard.find(e => e.id === entity.id);

type BoardSpaceship = (
	spaceship: Spaceship,
) => (
	entity: BoardableEntity,
) => { spaceship: Spaceship; entity: BoardableEntity };
export const boardSpaceship: BoardSpaceship = spaceship => entity => {
	if (hasBoarded(spaceship)(entity)) {
		throw new Error(
			`Entity '${entity.id}' has already boarded spaceship '${spaceship.id}'`,
		);
	}
	const newSpaceship: Spaceship = {
		...spaceship,
		onBoard: [...spaceship.onBoard, entity],
	};
	return {
		entity: {
			...entity,
			boardedIn: newSpaceship,
		},
		spaceship: newSpaceship,
	};
};
