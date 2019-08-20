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
