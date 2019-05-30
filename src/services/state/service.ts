import { Universe, EMPTY_UNIVERSE } from '../../assets/universe';

import { displaceEntityMutator } from '../../handlers/displacement/start/handler';
import { Player } from '../../handlers/player/types';

import { State, StateMutation, StateProperties } from './types';
import { createPlayerMutator } from "../../handlers/player/create/handler";

const mutations = {
  [StateMutation.CREATE_PLAYER]: createPlayerMutator,
  [StateMutation.DISPLACE_ENTITY]: displaceEntityMutator,
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
