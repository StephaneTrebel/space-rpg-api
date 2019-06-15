import { Player } from '../../handlers/player/types';

import { Id } from '../id/types';
import { Planet } from '../planet';
import { Position } from '../position/types';

export enum EntityType {
  NONE = 'none', // No entity should ever have this type. For tests only
  MOCK = 'mock', // Mock entities only
  PLANET = 'planet',
  PLAYER = 'player',
}

export interface BaseEntity {
  currentPosition: Position;
  id: Id;
  type: EntityType.MOCK;
}

export type Entity = BaseEntity | Planet | Player;
export type EntityList = Array<Entity>;
