import { Id } from '../utils/id/types';
import { Position } from '../utils/position/types';

import { EntityType } from './entity/types';

export interface Planet {
  currentPosition: Position;
  id: Id;
  name: string;
  type: EntityType.PLANET;
}
