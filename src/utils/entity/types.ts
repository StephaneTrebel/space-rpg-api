import { Id } from '../id/types';
import { Planet } from '../planet/types';
import { Player } from '../player/types';
import { Position } from '../position/types';
import { Spaceship } from '../spaceship/types';

export enum EntityType {
	MOCK = 'mock', // For tests only
	PLANET = 'planet',
	PLAYER = 'player',
	SPACESHIP = 'spaceship',
}

export interface MockEntity {
	currentPosition: Position;
	id: Id;
	name: string;
	type: EntityType.MOCK;
}

export type Entity = MockEntity | Planet | Player | Spaceship;
export type EntityList = Array<Entity>;
