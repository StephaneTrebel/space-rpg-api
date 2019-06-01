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
  loggerService.debug(`Result is ${JSON.stringify(result)}`);
  return result;
};

type GetMutatedState = (deps: {
  loggerService: LoggerService;
}) => (state: State) => (mutation: StateMutation) => (payload: any) => State;
const getMutatedState: GetMutatedState = ({ loggerService }) => (
  state: State,
) => (mutation: StateMutation) => (payload: any) => {
  loggerService.debug('Entering stateService.getMutatedState…');
  return mutations[mutation](state)(payload);
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
  const internal: { state: State } = { state: { ...initialState } };
  return {
    get: (prop: StateProperties) =>
      get({ loggerService })(internal.state)(prop),
    mutate: (mutation: StateMutation) => (payload: any) => {
      loggerService.debug(
        `Mutating state with mutation '${mutation}' and payload '${JSON.stringify(
          payload,
        )}'`,
      );
      internal.state = getMutatedState({ loggerService })(internal.state)(
        mutation,
      )(payload);
      loggerService.debug('Mutation complete');
      return internal.state;
    },
  };
};
