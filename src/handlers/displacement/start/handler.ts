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

// Higher Order Function, hence the dependencies are the second step (they will
// be the first call in the generated function)
type CreateExecutor = (params: {
  targetCoordinates: Position;
  entityId: Id;
  displacementId: Id;
}) => (injectedDeps: {
  loggerService: LoggerService;
  stateService: StateService;
  timeService: TimeService;
}) => Promise<void>;
export const createExecutor: CreateExecutor = ({
  targetCoordinates,
  entityId,
  displacementId,
}) => ({ loggerService, stateService, timeService }) => {
  const currentPosition: Position = getEntityCurrentPosition({
    id: entityId,
    loggerService,
    stateService,
  });
  const newPosition: Position = movePosition(
    currentPosition,
    targetCoordinates,
    SPEED,
  );
  loggerService.debug(
    `New position for entity '${entityId}': ${JSON.stringify(newPosition)}`,
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
      createDisplacement({ loggerService })({
        displacementId,
        entityId,
        targetCoordinates,
      }),
    ),
  );
};

export type CreateDisplacement = (deps: {
  loggerService: LoggerService;
}) => (params: {
  entityId: Id;
  displacementId?: Id;
  targetCoordinates: Position;
}) => Displacement;
export const createDisplacement: CreateDisplacement = ({ loggerService }) => ({
  entityId,
  displacementId,
  targetCoordinates,
}) => {
  loggerService.debug('Entering createDisplacement…');
  const id: Id = displacementId || 'foo';
  const newDisplacement: Displacement = {
    entityId,
    executor: createExecutor({
      displacementId: id,
      entityId,
      targetCoordinates,
    }),
    id,
    targetCoordinates,
    type: ActionType.DISPLACEMENT,
  };
  return newDisplacement;
};

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

type StartDisplacement = (deps: {
  loggerService: LoggerService;
  testId?: Id;
  timeService: TimeService;
}) => (context: Context, _req: any, res: Response) => Response;
export const startDisplacement: StartDisplacement = ({
  loggerService,
  testId,
  timeService,
}) => (context, _req, res) => {
  loggerService.debug('Entering startDisplacement…');
  const entityId = getEntityIdFromContext(context);
  const displacement = createDisplacement({ loggerService })({
    displacementId: testId,
    entityId,
    targetCoordinates: getTargetCoordinatesFromContext(context),
  });
  timeService.addAction(displacement);
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
