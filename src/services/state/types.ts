import { Universe } from '../../assets/universe';

import { Player } from '../../handlers/player/types';

export enum StateProperties {
  PLAYER_LIST = 'playerList',
  UNIVERSE = 'universe',
}

export interface State {
  [StateProperties.PLAYER_LIST]: Array<Player>;
  [StateProperties.UNIVERSE]: Universe;
}

export enum StateMutation {
  CREATE_PLAYER = 'CREATE_PLAYER',
  DISPLACE_ENTITY = 'DISPLACE_ENTITY',
}

export interface StateService {
  get: (prop: StateProperties) => Array<Player> | Universe;
  mutate: (mutation: StateMutation) => (payload: any) => State;
}
