import { LoggerService } from '../../services/logger/types';
import { State, StateService } from '../../services/state/types';

import { EntityType } from '../../utils/entity/types';
import { createEntity } from '../entity/utils';
import { Position } from '../position/types';
import { Id } from '../../utils/id/types';
import { Player } from '../../utils/player/types';

export const createPlayer = (params: {
	currentPosition?: Position;
	id?: Id;
	name?: string;
}) =>
	createEntity(EntityType.PLAYER)({
		currentPosition: params.currentPosition || {
			x: 0,
			y: 0,
			z: 0,
		},
		id: params.id || 'mockPlayer',
		name: params.name || 'foo',
	}) as Player;

export const createPlayerMutator = (currentState: State) => (
	newPlayer: Player,
): State => ({
	...currentState,
	entityList: [...currentState.entityList, newPlayer],
});

type GetPlayerFromStateService = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => (params: { id: Id }) => Player;
export const getPlayerFromStateService: GetPlayerFromStateService = ({
	loggerService,
	stateService,
}) => ({ id }) => {
	loggerService.debug('Entering getPlayerFromStateService…');
	const entity = stateService.findEntityById({
		id,
	}) as Player;
	loggerService.debug(
		`Player retrieved for id '${id}': ${JSON.stringify(entity)}`,
	);
	return entity;
};
