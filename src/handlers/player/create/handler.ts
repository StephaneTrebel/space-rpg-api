import { Response } from 'express';
import { Context } from 'openapi-backend';
import * as uuid from 'uuid';

import {
  State,
  StateMutation,
  StateService,
} from '../../../services/state/types';
import { EntityType } from '../../../types/entity';
import { Id } from '../../../types/id';
import { Position } from '../../../types/position';

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

export const addNewPlayer = (deps: { stateService: StateService }) => (
  context: Context,
  _req: any,
  res: Response,
) => {
  const username = context.request && context.request.requestBody.username;
  deps.stateService.mutate(StateMutation.CREATE_PLAYER)({
    username,
  });
  res.status(201).json({
    links: [
      {
        href: '/self-health/ping',
        rel: 'ping',
      },
    ],
    username,
  });
};
