import { Id } from '../../types/id';
import { Position } from '../../types/position';

export interface Player {
  currentPosition: Position;
  id: Id;
  username: string;
}

export type PlayerList = Array<Player>;
