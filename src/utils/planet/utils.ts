import { LoggerService } from '../../services/logger/types';
import { StateService } from '../../services/state/types';

import { Entity, EntityType } from '../entity/types';
import { createEntity } from '../entity/utils';
import { Id } from '../id/types';
import { Position } from '../position/types';

import { Planet } from './types';

export const createPlanet = (params: {
	currentPosition?: Position;
	id?: Id;
	name?: string;
}) =>
	createEntity(EntityType.PLANET)({
		currentPosition: params.currentPosition || {
			x: 0,
			y: 0,
			z: 0,
		},
		id: params.id || 'mockPlanet',
		name: params.name || 'foo',
	}) as Planet;

export const isEntityAPlanet = (entity: Entity): entity is Planet =>
	entity.type === EntityType.PLANET;

export const isThereAPlanetHere = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => (position: Position) => {
	deps.loggerService.debug('Entering isThereAPlanetHere...');
	return !!deps.stateService
		.findEntitiesByPosition({ position })
		.find(isEntityAPlanet);
};
