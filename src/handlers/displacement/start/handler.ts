import { Response } from 'express';
import { Context } from 'openapi-backend';

import { Id } from '../../../types/id';
import { Position } from '../../../types/position';

import { StateProperties, StateService } from '../../../services/state/types';
import { TimeService, ActionType } from '../../../services/time/types';
import { sendResponse } from '../../../services/webserver/service';

import { Displacement } from '../types';
import { Player, PlayerList } from '../../player/types';

export const createDisplacement = ({
  currentPosition,
  id,
  targetCoordinates,
}: {
  currentPosition: Position;
  id?: Id;
  targetCoordinates: Position;
}): Displacement => ({
  currentPosition,
  executor: () => Promise.resolve(),
  id: id || 'foo',
  targetCoordinates,
  type: ActionType.DISPLACEMENT,
});

export const getTargetCoordinatesFromContext = (context: Context): Position =>
  context.request && context.request.requestBody.targetCoordinates;

export const getEntityIdFromContext = (context: Context): string =>
  context.request && context.request.requestBody.entityId;

// @TODO I should move this elsewhere, most likely the future Entity handler
export const getEntityFromState = ({
  entityId,
  stateService,
}: {
  entityId: Id;
  stateService: StateService;
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
  entityId,
  stateService,
}: {
  entityId: Id;
  stateService: StateService;
}): Position => getEntityFromState({ stateService, entityId }).currentPosition;

export const startDisplacement = (deps: {
  id?: Id;
  stateService: StateService;
  timeService: TimeService;
}) => (context: Context, _req: any, res: Response) => {
  const displacement = createDisplacement({
    currentPosition: getEntityCurrentPosition({
      entityId: getEntityIdFromContext(context),
      stateService: deps.stateService,
    }),
    id: deps.id,
    targetCoordinates: getTargetCoordinatesFromContext(context),
  });
  deps.timeService.addAction(displacement);
  sendResponse(res)({
    links: [
      {
        href: `/target/${displacement.id}`,
        rel: 'status',
      },
    ],
    payload: { displacementId: displacement.id },
    status: 201,
  });
};
