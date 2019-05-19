import { Position } from '../../types/position';

export interface Player {
  username: string;
  currentPosition: Position;
}

export type PlayerList = Array<Player>;
