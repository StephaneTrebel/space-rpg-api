import { Id } from '../../../utils/id/types';
import { Position } from '../../../utils/position/types';

export interface DisplaceEntityPayload {
  entityId: Id;
  newPosition: Position;
}
