import { Response } from 'express';
import { Context } from 'openapi-backend';

import {
  State,
  StateMutation,
  StateService,
} from '../../../services/state/types';
import { EntityType } from '../../../types/entity';

import { Player } from '../types';

export const createPlayerMutator = (currentState: State) => (
  newPlayer: Player,
): State => ({
  ...currentState,
  entityList: [...currentState.entityList, newPlayer],
});

export const createPlayer = (deps: { stateService: StateService }) => (
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

export const MOCK_PLAYER: Player = {
  currentPosition: {
    x: 0,
    y: 0,
    z: 0,
  },
  id: 'lolilol',
  type: EntityType.PLAYER,
  username: 'foo',
};
export const createMockPlayer = ({
  currentPosition,
  id,
  type,
  username,
} = MOCK_PLAYER): Player => ({
  currentPosition,
  id,
  type,
  username,
});
