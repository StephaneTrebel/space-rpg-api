import { ActionType, Executor } from '../../services/time/types';

import { Id } from '../../utils/id/types';
import { Position } from '../../utils/position/types';

export interface Displacement {
  entityId: Id;
  executor: Executor;
  id: Id;
  targetCoordinates: Position;
  type: ActionType.DISPLACEMENT;
}
