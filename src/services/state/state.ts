import { Player } from '../../handlers/player/player.types';

export enum StateProperties {
  PLAYER_LIST = 'playerList',
}

interface State {
  [StateProperties.PLAYER_LIST]: Array<Player>;
}

export enum StateMutation {
  CREATE_PLAYER,
}

const mutations = {
  [StateMutation.CREATE_PLAYER]: (currentState: State) => (
    payload: Player,
  ): State => ({
    ...currentState,
    playerList: [...currentState.playerList, payload],
  }),
};

const get = (state: State) => (prop: StateProperties) => state[prop];

const mutate = (state: State) => (mutation: StateMutation) => (payload: any) =>
  (state = mutations[mutation](state)(payload));

export const stateServiceFactory = (initialState: State) => {
  const state: State = { ...initialState };
  return {
    get: get(state),
    mutate: mutate(state),
  };
};
