import { Response } from 'express';
import { Context } from 'openapi-backend';

import { StateService, StateMutation } from '../../../services/state/state';

import { Player } from '../player.types';

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

export const createMockPlayer: () => Player = () => ({
  currentPosition: {
    x: 0,
    y: 0,
    z: 0,
  },
  username: 'foo',
});
