import { ActionType, Executor } from '../../services/time/types';

import { Id } from '../../types/id';
import { Position } from '../../types/position';

export interface Displacement {
  type: ActionType.DISPLACEMENT;
  id: Id;
  currentPosition: Position;
  executor: Executor;
  targetCoordinates: Position;
}
