import { ActionType, Executor } from '../../services/time/types';

import { Id } from '../id/types';
import { Position } from '../position/types';

export interface Displacement {
	entityId: Id;
	executor: Executor;
	id: Id;
	targetCoordinates: Position;
	type: ActionType.DISPLACEMENT;
}

export interface DisplaceEntityPayload {
	entityId: Id;
	newPosition: Position;
}
