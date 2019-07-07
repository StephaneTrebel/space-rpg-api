import { EntityType } from '../../utils/entity/types';
import { Id } from '../../utils/id/types';
import { Position } from '../../utils/position/types';

export interface Spaceship {
  currentPosition: Position;
  fuel: number;
  id: Id;
  name: string;
  type: EntityType.SPACESHIP;
}
export type SpaceshipList = Array<Spaceship>;
