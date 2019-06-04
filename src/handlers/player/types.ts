import { EntityType } from "../../types/entity";
import { Id } from '../../types/id';
import { Position } from '../../types/position';

export interface Player {
  currentPosition: Position;
  id: Id;
  username: string;
  type: EntityType.PLAYER;
}
export type PlayerList = Array<Player>;
