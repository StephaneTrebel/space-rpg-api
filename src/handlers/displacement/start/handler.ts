import { Response } from 'express';
import { Context } from 'openapi-backend';

import { Id } from '../../../types/id';
import { Position } from '../../../types/position';

import { LoggerService } from '../../../services/logger/types';
import {
  StateProperties,
  StateService,
  StateMutation,
  State,
} from '../../../services/state/types';
import { TimeService, ActionType } from '../../../services/time/types';
import { sendResponse } from '../../../services/webserver/service';

import { Player, PlayerList } from '../../player/types';

import { Displacement } from '../types';

import { DisplaceEntityPayload } from './types';

const SPEED = 1;

export const moveTowards = (
  currentCoordinate: number,
  targetCoordinate: number,
  speed: number,
) => {
  const direction = targetCoordinate < currentCoordinate;
  const movedCoordinate = currentCoordinate + (direction ? -1 : 1) * speed;
  const newCoordinate = direction
    ? movedCoordinate < targetCoordinate
      ? targetCoordinate
      : movedCoordinate
    : movedCoordinate > targetCoordinate
    ? targetCoordinate
    : movedCoordinate;
  return newCoordinate;
};

export const movePosition = (
  currentPosition: Position,
  targetPosition: Position,
  speed: number,
): Position => ({
  x: moveTowards(targetPosition.x, currentPosition.x, speed),
  y: moveTowards(targetPosition.y, currentPosition.y, speed),
  z: moveTowards(targetPosition.z, currentPosition.z, speed),
});

export type CreateDisplacement = (params: {
  currentPosition: Position;
  entityId: Id;
  displacementId?: Id;
  targetCoordinates: Position;
}) => Displacement;
export const createDisplacement: CreateDisplacement = ({
  currentPosition,
  displacementId,
  entityId,
  targetCoordinates,
}) => ({
  currentPosition,
  executor: ({ loggerService, stateService, timeService }) => {
    const newPosition: Position = movePosition(
      currentPosition,
      targetCoordinates,
      SPEED,
    );
    loggerService.debug(
      `New position for entity "${entityId}": ${JSON.stringify(newPosition)}`,
    );
    // Returning a promise here because it's needed but stateService.mutate
    // is not async yet.
    return Promise.resolve(
      stateService.mutate(StateMutation.DISPLACE_ENTITY)({
        entityId,
        newPosition,
      }),
    ).then(() =>
      timeService.addAction(
        createDisplacement({
          currentPosition: newPosition,
          displacementId,
          entityId,
          targetCoordinates,
        }),
      ),
    );
  },
  id: displacementId || 'foo',
  targetCoordinates,
  type: ActionType.DISPLACEMENT,
});

export const getTargetCoordinatesFromContext = (context: Context): Position =>
  context.request && context.request.requestBody.targetCoordinates;

export const getEntityIdFromContext = (context: Context): string =>
  context.request && context.request.requestBody.entityId;

// @TODO Move this elsewhere, most likely to the future Entity handler
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

export const displaceEntityMutator = (currentState: State) => ({
  entityId,
  newPosition,
}: DisplaceEntityPayload): State => ({
  ...currentState,
  playerList: currentState.playerList.map(player =>
    player.id === entityId
      ? { ...player, currentPosition: newPosition }
      : player,
  ),
});

export const startDisplacement = (deps: {
  id?: Id;
  loggerService: LoggerService;
  stateService: StateService;
  timeService: TimeService;
}) => (context: Context, _req: any, res: Response) => {
  deps.loggerService.debug('Entering startDisplacement…');
  const entityId = getEntityIdFromContext(context);
  const displacement = createDisplacement({
    currentPosition: getEntityCurrentPosition({
      id: entityId,
      loggerService: deps.loggerService,
      stateService: deps.stateService,
    }),
    displacementId: deps.id,
    entityId,
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
