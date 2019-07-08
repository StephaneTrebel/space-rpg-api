import { EntityType } from '../../utils/entity/types';
import { Id } from '../../utils/id/types';
import { Position } from '../../utils/position/types';
import { Spaceship } from '../spaceship/types';

export type PlayerCarryingEntity = Spaceship;

export interface Player {
  boardedIn: PlayerCarryingEntity | null;
  currentPosition: Position;
  id: Id;
  name: string;
  type: EntityType.PLAYER;
}
export type PlayerList = Array<Player>;
