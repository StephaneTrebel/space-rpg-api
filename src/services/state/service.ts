import { Universe, EMPTY_UNIVERSE } from '../../assets/universe';

import { Displacement } from '../../handlers/displacement/types';
import { Player } from '../../handlers/player/types';

import { State, StateMutation, StateProperties } from './types';

const mutations = {
  [StateMutation.CREATE_PLAYER]: (currentState: State) => (
    payload: Player,
  ): State => ({
    ...currentState,
    playerList: [...currentState.playerList, payload],
  }),
  [StateMutation.DISPLACE_ENTITY]: (currentState: State) => (
    // @TODO WIP
    _payload: Displacement,
  ): State => ({
    ...currentState,
    playerList: [...currentState.playerList],
  }),
};

const get = (state: State) => (prop: StateProperties) => state[prop];

const mutate = (state: State) => (mutation: StateMutation) => (payload: any) =>
  (state = mutations[mutation](state)(payload));

export interface StateService {
  get: (prop: StateProperties) => Array<Player> | Universe;
  mutate: (mutation: StateMutation) => (payload: any) => State;
}

export const EMPTY_STATE = { playerList: [], universe: EMPTY_UNIVERSE };
export const stateServiceFactory = (
  initialState: State = EMPTY_STATE,
): StateService => {
  const state: State = { ...initialState };
  return {
    get: get(state),
    mutate: mutate(state),
  };
};
