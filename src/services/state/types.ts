import { EntityList, Entity } from '../../utils/entity/types';
import { Id } from '../../utils/id/types';
import { Position } from '../../utils/position/types';

export enum StateProperties {
	ENTITY_LIST = 'entityList',
}

export interface State {
	[StateProperties.ENTITY_LIST]: EntityList;
}

export enum StateMutation {
	CREATE_PLAYER = 'CREATE_PLAYER',
	CREATE_SPACESHIP = 'CREATE_SPACESHIP',
	DISPLACE_ENTITY = 'DISPLACE_ENTITY',
	CONSUME_FUEL = 'CONSUME_FUEL',
	REFUEL_ENTITY = 'REFUEL_ENTITY',
}

export interface StateService {
	findEntitiesByPosition: (params: { position: Position }) => EntityList;
	findEntityById: (params: { id: Id }) => Entity;
	getNearbyEntities: (params: { id: Id }) => EntityList;
	mutate: (params: { mutation: StateMutation; payload: any }) => Promise<void>;
}
