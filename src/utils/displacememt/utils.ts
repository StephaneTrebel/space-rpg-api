import * as uuid from 'uuid';

import { LoggerService } from '../../services/logger/types';
import { StateService, StateMutation, State } from '../../services/state/types';
import { TimeService, ActionType, Executor } from '../../services/time/types';

import { EntityType } from '../entity/types';
import { Id } from '../id/types';
import { isId } from '../id/utils';
import { Position } from '../position/types';
import {
	getEntityCurrentPosition,
	movePosition,
	isSamePosition,
} from '../position/utils';
import { getBoardedEntities } from '../spaceship/utils';

import { Displacement, DisplaceEntityPayload } from './types';

const DISTANCE_PER_TICK = 1;

export const createDisplacementMock = ({
	entityId,
	executor,
	id,
	targetCoordinates,
}: {
	entityId?: Id;
	executor?: Executor;
	id?: Id;
	targetCoordinates?: Position;
}): Displacement => ({
	entityId: entityId || 'mockEntityId',
	executor: executor || (() => Promise.resolve()),
	id: id || 'mockId',
	targetCoordinates: targetCoordinates || {
		x: 0,
		y: 0,
		z: 0,
	},
	type: ActionType.DISPLACEMENT,
});

// Higher Order Function, hence the dependencies are the second step (they will
// be the first call in the generated function)
type CreateExecutor = (params: {
	targetCoordinates: Position;
	entityId: Id;
	displacementId: Id;
}) => (injectedDeps: {
	loggerService: LoggerService;
	stateService: StateService;
	timeService: TimeService;
}) => Promise<void>;
export const createExecutor: CreateExecutor = ({
	targetCoordinates,
	entityId,
	displacementId,
}) => ({ loggerService, stateService, timeService }) => {
	const currentPosition: Position = getEntityCurrentPosition({
		id: entityId,
		loggerService,
		stateService,
	});
	const newPosition: Position = movePosition({ loggerService })({
		currentPosition,
		distancePerTick: DISTANCE_PER_TICK,
		targetPosition: targetCoordinates,
	});
	loggerService.debug(
		`New position for entity '${entityId}': ${JSON.stringify(newPosition)}`,
	);
	return Promise.all([
		stateService.mutate({
			mutation: StateMutation.DISPLACE_ENTITY,
			payload: {
				entityId,
				newPosition,
			},
		}),
		...(
			getBoardedEntities({ loggerService, stateService })({
				id: entityId,
			})
		).map(entity =>
			stateService.mutate({
				mutation: StateMutation.DISPLACE_ENTITY,
				payload: {
					entityId: entity.id,
					newPosition,
				},
			}),
		),
	]).then(() => {
		if (!isSamePosition(currentPosition, targetCoordinates)) {
			return timeService.addAction(
				createDisplacement({ loggerService, stateService })({
					displacementId,
					entityId,
					target: targetCoordinates,
				}),
			);
		}
	});
};

export type CreateDisplacement = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => (params: {
	entityId: Id;
	displacementId?: Id;
	target: Position | Id;
}) => Displacement;
export const createDisplacement: CreateDisplacement = ({
	loggerService,
	stateService,
}) => ({ entityId, displacementId, target }) => {
	loggerService.debug('Entering createDisplacement…');
	const entity = stateService.findEntity({ id: entityId });
	if ([EntityType.PLANET, EntityType.SPACESHIP].includes(entity.type)) {
		const id: Id = displacementId || uuid.v4();
		const targetCoordinates: Position = isId(target)
			? getEntityCurrentPosition({
					id: target as Id,
					loggerService,
					stateService,
			  })
			: (target as Position);
		const newDisplacement: Displacement = {
			entityId,
			executor: createExecutor({
				displacementId: id,
				entityId: entity.id,
				targetCoordinates,
			}),
			id,
			targetCoordinates,
			type: ActionType.DISPLACEMENT,
		};
		return newDisplacement;
	}
	throw new Error(`Entity type '${entity.type}' cannot be displaced`);
};

export const displaceEntityMutator = (currentState: State) => ({
	entityId,
	newPosition,
}: DisplaceEntityPayload): State => ({
	...currentState,
	entityList: currentState.entityList.map(entity =>
		entity.id === entityId
			? { ...entity, currentPosition: newPosition }
			: entity,
	),
});
