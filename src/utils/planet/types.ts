import { Id } from '../id/types';
import { Position } from '../position/types';

import { EntityType } from '../entity/types';

export interface Planet {
	currentPosition: Position;
	id: Id;
	name: string;
	type: EntityType.PLANET;
}
