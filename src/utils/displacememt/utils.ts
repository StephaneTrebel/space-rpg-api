import * as uuid from 'uuid';

import { LoggerService } from '../../services/logger/types';
import { StateService, StateMutation, State } from '../../services/state/types';
import { TimeService, ActionType, Executor } from '../../services/time/types';

import { EntityType } from '../entity/types';
import { consumeFuelOnEntity, hasEnoughFuelForOneTick } from '../fuel/utils';
import { Id } from '../id/types';
import { isId } from '../id/utils';
import { isThereAPlanetHere } from '../planet/utils';
import { Position } from '../position/types';
import {
	getEntityCurrentPosition,
	movePosition,
	isSamePosition,
} from '../position/utils';
import {
	getBoardedEntities,
	getSpaceshipFromStateService,
} from '../spaceship/utils';

import { Displacement } from './types';

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

type DisplaceEntity = (deps: {
	stateService: StateService;
}) => (params: { entityId: Id; newPosition: Position }) => Promise<void>;
export const displaceEntity: DisplaceEntity = ({ stateService }) => ({
	entityId,
	newPosition,
}) =>
	stateService.mutate({
		mutation: StateMutation.DISPLACE_ENTITY,
		payload: {
			entityId,
			newPosition,
		},
	});

type DisplaceAllBoardedEntities = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => (params: { entityId: Id; newPosition: Position }) => Promise<Array<void>>;
export const displaceAllBoardedEntities: DisplaceAllBoardedEntities = ({
	loggerService,
	stateService,
}) => ({ entityId, newPosition }) =>
	Promise.all([
		...getBoardedEntities({ loggerService, stateService })({
			id: entityId,
		}).map(entity =>
			displaceEntity({ stateService })({ entityId: entity.id, newPosition }),
		),
	]);

type ExecutePostArrivalTriggers = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => (params: {
	entityId: Id;
	targetCoordinates: Position;
}) => Promise<Array<void>>;
export const executePostArrivalTriggers: ExecutePostArrivalTriggers = ({
	loggerService,
	stateService,
}) => ({ entityId, targetCoordinates }) =>
	Promise.all([
		isThereAPlanetHere({ loggerService, stateService })(targetCoordinates)
			? stateService.mutate({
					mutation: StateMutation.REFUEL_ENTITY,
					payload: {
						entityId,
					},
			  })
			: undefined,
	]);

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
}) => Promise<Array<void>>;
export const createExecutor: CreateExecutor = ({
	targetCoordinates,
	entityId,
	displacementId,
}) => ({ loggerService, stateService, timeService }) => {
	if (
		hasEnoughFuelForOneTick(
			getSpaceshipFromStateService({ loggerService, stateService })({
				id: entityId,
			}),
		)
	) {
		const newPosition: Position = movePosition({ loggerService })({
			currentPosition: getEntityCurrentPosition({
				id: entityId,
				loggerService,
				stateService,
			}),
			distancePerTick: DISTANCE_PER_TICK,
			targetPosition: targetCoordinates,
		});
		return Promise.all([
			consumeFuelOnEntity({ stateService })({ entityId }),
			displaceEntity({ stateService })({ entityId, newPosition }),
			displaceAllBoardedEntities({ loggerService, stateService })({
				entityId,
				newPosition,
			}),
		]).then(() =>
			isSamePosition(
				getEntityCurrentPosition({
					id: entityId,
					loggerService,
					stateService,
				}),
				targetCoordinates,
			)
				? executePostArrivalTriggers({ loggerService, stateService })({
						entityId,
						targetCoordinates,
				  })
				: [
						timeService.addAction(
							createDisplacement({ loggerService, stateService })({
								displacementId,
								entityId,
								target: targetCoordinates,
							}),
						),
				  ],
		);
	}
	return Promise.resolve([]);
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
	const entity = stateService.findEntityById({ id: entityId });
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
}: {
	entityId: Id;
	newPosition: Position;
}): State => ({
	...currentState,
	entityList: currentState.entityList.map(entity =>
		entity.id === entityId
			? {
					...entity,
					currentPosition: newPosition,
			  }
			: entity,
	),
});
