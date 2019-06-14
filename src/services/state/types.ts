import { Universe } from '../../assets/universe';

import { EntityType, EntityList, Entity } from '../../utils/entity/types';
import { Id } from '../../utils/id/types';

export enum StateProperties {
  ENTITY_LIST = 'entityList',
  UNIVERSE = 'universe',
}

export interface State {
  [StateProperties.ENTITY_LIST]: EntityList;
  [StateProperties.UNIVERSE]: Universe;
}

export enum StateMutation {
  CREATE_PLAYER = 'CREATE_PLAYER',
  DISPLACE_ENTITY = 'DISPLACE_ENTITY',
}

export interface StateService {
  findEntity: (params: { id: Id; type: EntityType }) => Entity;
  get: (prop: StateProperties) => EntityList | Universe;
  mutate: (mutation: StateMutation) => (payload: any) => State;
}
