import { Response } from 'express';
import { Context } from 'openapi-backend';

import { Id } from '../../../types/id';
import { Position } from '../../../types/position';

import { StateProperties, StateService } from '../../../services/state/types';
import { TimeService, ActionType } from '../../../services/time/types';

import { Displacement } from '../types';
import { Player, PlayerList } from '../../player/types';

export const createDisplacement = ({
  currentPosition,
  targetCoordinates,
}: {
  currentPosition: Position;
  targetCoordinates: Position;
}): Displacement => ({
  currentPosition,
  executor: () => Promise.resolve(),
  id: 'foo',
  targetCoordinates,
  type: ActionType.DISPLACEMENT,
});

export const getTargetCoordinatesFromContext = (context: Context): Position =>
  context.request && context.request.requestBody.targetCoordinates;

export const getEntityIdFromContext = (context: Context): string =>
  context.request && context.request.requestBody.entityId;

export const getEntityFromState = ({
  stateService,
  entityId,
}: {
  stateService: StateService;
  entityId: Id;
}): Player => {
  const entity = (stateService.get(
    StateProperties.PLAYER_LIST,
  ) as PlayerList).find(player => player.username === entityId);
  if (!!entity) {
    return entity;
  }
  throw new Error(`No entity with id "${entityId}"`);
};

export const getEntityCurrentPosition = ({
  stateService,
  entityId,
}: {
  stateService: StateService;
  entityId: Id;
}): Position => getEntityFromState({ stateService, entityId }).currentPosition;

export const sendResponse = (res: Response) => (displacementId: string) =>
  res.status(201).json({
    displacementId,
    links: [
      {
        href: `/target/${displacementId}/status`,
        rel: 'status',
      },
    ],
  });

export const startDisplacement = (deps: {
  stateService: StateService;
  timeService: TimeService;
}) => (context: Context, _req: any, res: Response) => {
  const displacement = createDisplacement({
    currentPosition: getEntityCurrentPosition({
      entityId: getEntityIdFromContext(context),
      stateService: deps.stateService,
    }),
    targetCoordinates: getTargetCoordinatesFromContext(context),
  });
  deps.timeService.addAction(displacement);
  sendResponse(res)(displacement.id);
};
