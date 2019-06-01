import { ActionType, Executor } from '../../services/time/types';

import { Id } from '../../types/id';
import { Position } from '../../types/position';

export interface Displacement {
  entityId: Id;
  executor: Executor;
  id: Id;
  targetCoordinates: Position;
  type: ActionType.DISPLACEMENT;
}
