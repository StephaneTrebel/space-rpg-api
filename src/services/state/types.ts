import { EntityType, EntityList, Entity } from '../../utils/entity/types';
import { Id } from '../../utils/id/types';

export enum StateProperties {
  ENTITY_LIST = 'entityList',
}

export interface State {
  [StateProperties.ENTITY_LIST]: EntityList;
}

export enum StateMutation {
  CREATE_PLAYER = 'CREATE_PLAYER',
  DISPLACE_ENTITY = 'DISPLACE_ENTITY',
}

export interface StateService {
  findEntity: (params: { id: Id; type: EntityType }) => Entity;
  get: (prop: StateProperties) => EntityList;
  mutate: (mutation: StateMutation) => (payload: any) => State;
}
