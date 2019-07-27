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
