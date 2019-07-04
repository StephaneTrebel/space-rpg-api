import { EntityType } from '../../utils/entity/types';
import { Id } from '../../utils/id/types';
import { Position } from '../../utils/position/types';

export interface Player {
  currentPosition: Position;
  id: Id;
  name: string;
  type: EntityType.PLAYER;
}
export type PlayerList = Array<Player>;
