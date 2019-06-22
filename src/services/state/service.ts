import { LoggerService } from '../logger/types';

import { displaceEntityMutator } from '../../utils/displacememt/utils';
import { Entity } from '../../utils/entity/types';
import { Id } from '../../utils/id/types';
import { createPlayerMutator } from '../../utils/player/utils';

import { State, StateMutation, StateService } from './types';

const mutations = {
  [StateMutation.CREATE_PLAYER]: createPlayerMutator,
  [StateMutation.DISPLACE_ENTITY]: displaceEntityMutator,
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
