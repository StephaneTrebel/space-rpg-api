import { Id } from '../../../types/id';
import { Position } from '../../../types/position';

export interface DisplaceEntityPayload {
  entityId: Id;
  newPosition: Position;
}
