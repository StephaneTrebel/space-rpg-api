import { displaceEntityMutator } from '../../handlers/displacement/start/handler';
import { createPlayerMutator } from '../../handlers/player/create/handler';

import { LoggerService } from '../logger/types';

import { Id } from '../../utils/id/types';
import { Entity, EntityList } from '../../utils/entity/types';

import { State, StateMutation, StateProperties, StateService } from './types';

const mutations = {
  [StateMutation.CREATE_PLAYER]: createPlayerMutator,
  [StateMutation.DISPLACE_ENTITY]: displaceEntityMutator,
};

type Get = (deps: {
  loggerService: LoggerService;
}) => (state: State) => (prop: StateProperties) => EntityList;
const get: Get = ({ loggerService }) => (state: State) => (
  prop: StateProperties,
) => {
  loggerService.debug('Entering stateService.get…');
  loggerService.debug(`Retrieving prop '${prop}' from state`);
  const result = state[prop];
  loggerService.debug(`Result is ${JSON.stringify(result)}`);
  return result;
};

type FindEntity = (deps: {
  loggerService: LoggerService;
}) => (state: State) => (params: { id: Id }) => Entity;
export const findEntity: FindEntity = ({ loggerService }) => state => ({
  id,
}) => {
  loggerService.debug('Entering stateService.findEntity…');
  const maybeEntity = state.entityList.find(entity => entity.id === id);
  if (!maybeEntity) {
    throw new Error(`No entity with id "${id}"`);
  }
  return maybeEntity;
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

export const EMPTY_STATE: State = { entityList: [] };

type StateServiceFactory = (deps: {
  loggerService: LoggerService;
}) => (initialState: State) => StateService;
export const stateServiceFactory: StateServiceFactory = ({ loggerService }) => (
  initialState: State,
): StateService => {
  const internal: { state: State } = { state: { ...initialState } };
  return {
    findEntity: ({ id }) =>
      findEntity({ loggerService })(internal.state)({ id }),
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
