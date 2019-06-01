import { Universe, EMPTY_UNIVERSE } from '../../assets/universe';

import { displaceEntityMutator } from '../../handlers/displacement/start/handler';
import { PlayerList } from '../../handlers/player/types';

import { State, StateMutation, StateProperties } from './types';
import { createPlayerMutator } from '../../handlers/player/create/handler';
import { LoggerService } from '../logger/types';

const mutations = {
  [StateMutation.CREATE_PLAYER]: createPlayerMutator,
  [StateMutation.DISPLACE_ENTITY]: displaceEntityMutator,
};

type Get = (deps: {
  loggerService: LoggerService;
}) => (state: State) => (prop: StateProperties) => PlayerList | Universe;
const get: Get = ({ loggerService }) => (state: State) => (
  prop: StateProperties,
) => {
  loggerService.debug('Entering stateService.get…');
  loggerService.debug(`Retrieving prop '${prop}' from state`);
  const result = state[prop];
  loggerService.debug(`Result is ${result}`);
  return result;
};

type Mutate = (deps: {
  loggerService: LoggerService;
}) => (state: State) => (mutation: StateMutation) => (payload: any) => State;
const mutate: Mutate = ({ loggerService }) => (state: State) => (
  mutation: StateMutation,
) => (payload: any) => {
  loggerService.debug('Entering stateService.mutate…');
  loggerService.debug(
    `Mutating state with mutation '${mutation}' and payload '${JSON.stringify(
      payload,
    )}'`,
  );
  state = mutations[mutation](state)(payload);
  loggerService.debug('Mutation complete');
  return state;
};

export interface StateService {
  get: (prop: StateProperties) => PlayerList | Universe;
  mutate: (mutation: StateMutation) => (payload: any) => State;
}

export const EMPTY_STATE = { playerList: [], universe: EMPTY_UNIVERSE };

type StateServiceFactory = (deps: {
  loggerService: LoggerService;
}) => (initialState: State) => StateService;
export const stateServiceFactory: StateServiceFactory = ({ loggerService }) => (
  initialState: State,
): StateService => {
  const state: State = { ...initialState };
  return {
    get: get({ loggerService })(state),
    mutate: mutate({ loggerService })(state),
  };
};
