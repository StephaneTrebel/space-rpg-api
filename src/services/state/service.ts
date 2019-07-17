import { LoggerService } from '../logger/types';

import { displaceEntityMutator } from '../../utils/displacememt/utils';
import { Entity, EntityList } from '../../utils/entity/types';
import { Id } from '../../utils/id/types';
import { createPlayerMutator } from '../../utils/player/utils';
import { areNearby } from '../../utils/position/utils';

import { State, StateMutation, StateService } from './types';
import { createSpaceshipMutator } from '../../utils/spaceship/utils';

export const EMPTY_STATE: State = { entityList: [] };

interface StateServiceInternal {
	state: State;
}

type FindEntity = (deps: {
	loggerService: LoggerService;
}) => (internal: StateServiceInternal) => (params: { id: Id }) => Entity;
export const findEntity: FindEntity = deps => internal => params => {
	deps.loggerService.debug('Entering stateService.findEntity…');
	const maybeEntity = internal.state.entityList.find(
		entity => entity.id === params.id,
	);
	if (!maybeEntity) {
		throw new Error(`No entity with id "${params.id}"`);
	}
	return maybeEntity;
};

type GetNearbyEntities = (deps: {
	loggerService: LoggerService;
}) => (internal: StateServiceInternal) => (params: { id: Id }) => EntityList;
export const getNearbyEntities: GetNearbyEntities = deps => internal => params => {
	const RANGE = 10; // This will be made variable later
	deps.loggerService.debug('Entering getNearbyEntities…');
	const currEntity = findEntity(deps)(internal)(params);
	return internal.state.entityList.filter(
		entity =>
			entity.id !== currEntity.id &&
			areNearby(RANGE)(entity.currentPosition, currEntity.currentPosition),
	);
};

type Mutate = (deps: {
	loggerService: LoggerService;
}) => (
	internal: StateServiceInternal,
) => (params: { mutation: StateMutation; payload: any }) => Promise<void>;
export const mutate: Mutate = deps => internal => params =>
	new Promise((resolve, reject) => {
		try {
			deps.loggerService.debug('Entering stateService.mutate…');
			const mutations = {
				[StateMutation.CREATE_PLAYER]: createPlayerMutator,
				[StateMutation.CREATE_SPACESHIP]: createSpaceshipMutator,
				[StateMutation.DISPLACE_ENTITY]: displaceEntityMutator,
			};
			deps.loggerService.debug(
				`Mutating state with mutation '${
					params.mutation
				}' and payload '${JSON.stringify(params.payload)}'`,
			);
			internal.state = mutations[params.mutation](internal.state)(
				params.payload,
			);
			deps.loggerService.debug('Mutation complete');
			return resolve();
		} catch (error) {
			deps.loggerService.error(
				`Error while mutating service. Params were ${JSON.stringify(
					params,
				)}, Error was: ${error.message}`,
			);
			return reject(error);
		}
	});

type StateServiceFactory = (deps: {
	loggerService: LoggerService;
}) => (initialState: State) => StateService;
export const stateServiceFactory: StateServiceFactory = deps => (
	initialState: State,
): StateService => {
	const internal: { state: State } = { state: { ...initialState } };
	return {
		findEntity: findEntity(deps)(internal),
		getNearbyEntities: getNearbyEntities(deps)(internal),
		mutate: mutate(deps)(internal),
	};
};
