import { Id } from '../id/types';
import { generateId } from '../id/utils';
import { Position } from '../position/types';

import { Entity, EntityType, MockEntity } from './types';
import { BoardableEntityList, Spaceship } from '../spaceship/types';
import { Player } from '../player/types';
import { Planet } from '../planet/types';

type CreateEntity = (
	type: EntityType,
) => (params: {
	currentPosition?: Position;
	fuel?: number;
	id?: Id;
	name?: string;
	onBoard?: BoardableEntityList;
}) => Entity;
export const createEntity: CreateEntity = type => params => {
	const commonEntityProps = {
		currentPosition: { x: 0, y: 0, z: 0 },
		id: generateId(),
		name: 'unknown',
		...params,
	};
	switch (type) {
		case EntityType.MOCK:
			const baseEntity: MockEntity = {
				...commonEntityProps,
				type,
			};
			return baseEntity;
		case EntityType.PLANET:
			const planet: Planet = {
				...commonEntityProps,
				type,
			};
			return planet;
		case EntityType.PLAYER:
			const player: Player = {
				...commonEntityProps,
				boardedIn: null,
				type,
			};
			return player;
		case EntityType.SPACESHIP:
			const spaceship: Spaceship = {
				...commonEntityProps,
				fuel: typeof params.fuel === 'undefined' ? 1000 : params.fuel,
				onBoard: typeof params.onBoard === 'undefined' ? [] : params.onBoard,
				type,
			};
			return spaceship;
	}
};

type GetEntityDetailsText = (params: { entity: Entity }) => string;
export const getEntityDetailsText: GetEntityDetailsText = ({ entity }) => {
	const dict: { [key in EntityType]: (entity: Entity) => string } = {
		[EntityType.MOCK]: e => e.name,
		[EntityType.PLANET]: e =>
			`Planet ${e.name} is located at {x:${e.currentPosition.x}, y:${
				e.currentPosition.y
			}, z:${
				e.currentPosition.z
			} }. It is your average-sized chunk of rock that has been colonized by terrans long ago.`,
		[EntityType.PLAYER]: e =>
			`${
				e.name
			} is a player. Whether they are alive or dead is a matter of speculation, and you will have to see it yourself...`,
		[EntityType.SPACESHIP]: e => `${e.name} is a flamboyant spaceship.`,
	};
	return dict[entity.type](entity);
};
