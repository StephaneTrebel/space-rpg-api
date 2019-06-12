import * as uuid from 'uuid';

import { LoggerService } from '../../../services/logger/types';
import { HandlerResponse } from '../../../services/openapi-backend/types';
import {
  State,
  StateMutation,
  StateService,
} from '../../../services/state/types';

import { EntityType } from '../../../types/entity';
import { Id } from '../../../types/id';
import { Position } from '../../../types/position';

import { SELF_HEALTH_LINK } from '../../miscellaneous/self-health/handler';

import { Player } from '../types';

export const MOCK_PLAYER: Player = {
  currentPosition: {
    x: 0,
    y: 0,
    z: 0,
  },
  id: 'mockPlayer',
  type: EntityType.PLAYER,
  username: 'foo',
};

type CreatePlayer = (params: {
  currentPosition: Position;
  id?: Id;
  username: string;
}) => Player;
export const createPlayer: CreatePlayer = ({
  currentPosition,
  id,
  username,
}) => ({
  currentPosition,
  id: id || uuid.v4(),
  type: EntityType.PLAYER,
  username,
});

export const createPlayerMutator = (currentState: State) => (
  newPlayer: Player,
): State => ({
  ...currentState,
  entityList: [...currentState.entityList, newPlayer],
});

type AddPlayer = (deps: {
  loggerService: LoggerService;
  stateService: StateService;
}) => (context: any) => HandlerResponse;
export const addNewPlayer: AddPlayer = deps => context => {
  const username = context.request && context.request.requestBody.username;
  const newPlayer = createPlayer({
    currentPosition: { x: 0, y: 0, z: 0 },
    username,
  });
  deps.stateService.mutate(StateMutation.CREATE_PLAYER)(newPlayer);
  return {
    json: {
      links: [SELF_HEALTH_LINK],
      player: newPlayer,
    },
    status: 201,
  };
};
