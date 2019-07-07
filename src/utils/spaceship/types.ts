import { EntityType } from '../../utils/entity/types';
import { Id } from '../../utils/id/types';
import { Position } from '../../utils/position/types';

import { Player } from '../player/types';

export type BoardableEntity = Player;
export type BoardableEntityList = Array<BoardableEntity>;

export interface Spaceship {
  currentPosition: Position;
  fuel: number;
  id: Id;
  name: string;
  onBoard: BoardableEntityList;
  type: EntityType.SPACESHIP;
}
export type SpaceshipList = Array<Spaceship>;
