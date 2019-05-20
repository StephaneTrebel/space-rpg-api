import { Response } from 'express';
import { Context } from 'openapi-backend';

import { Id } from '../../../types/id';
import { Position } from '../../../types/position';

import { LoggerService } from '../../../services/logger/types';
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
  id,
  loggerService,
  stateService,
}: {
  id: Id;
  loggerService: LoggerService;
  stateService: StateService;
}): Player => {
  loggerService.debug('Entering getEntityFromState…');
  const entity = (stateService.get(
    StateProperties.PLAYER_LIST,
  ) as PlayerList).find(player => player.id === id);
  if (!!entity) {
    return entity;
  }
  throw new Error(`No entity with id "${id}"`);
};

export const getEntityCurrentPosition = ({
  id,
  loggerService,
  stateService,
}: {
  id: Id;
  loggerService: LoggerService;
  stateService: StateService;
}): Position => {
  loggerService.debug('Entering getEntityCurrentPosition…');
  return getEntityFromState({ id, loggerService, stateService })
    .currentPosition;
};

export const startDisplacement = (deps: {
  id?: Id;
  loggerService: LoggerService;
  stateService: StateService;
  timeService: TimeService;
}) => (context: Context, _req: any, res: Response) => {
  deps.loggerService.debug('Entering startDisplacement…');
  const displacement = createDisplacement({
    currentPosition: getEntityCurrentPosition({
      id: getEntityIdFromContext(context),
      loggerService: deps.loggerService,
      stateService: deps.stateService,
    }),
    id: deps.id,
    targetCoordinates: getTargetCoordinatesFromContext(context),
  });
  deps.timeService.addAction(displacement);
  return sendResponse(res)({
    links: [
      {
        href: `/displacement/${displacement.id}`,
        rel: 'details',
      },
    ],
    payload: { displacementId: displacement.id },
    status: 201,
  });
};
