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

const DISTANCE_PER_TICK = 1;

type MovePosition = (deps: {
  loggerService: LoggerService;
}) => (params: {
  currentPosition: Position;
  distancePerTick: number;
  targetPosition: Position;
}) => Position;
export const movePosition: MovePosition = ({ loggerService }) => ({
  currentPosition,
  distancePerTick,
  targetPosition,
}): Position => {
  const distanceX = targetPosition.x - currentPosition.x;
  const distanceY = targetPosition.y - currentPosition.y;
  const distanceZ = targetPosition.z - currentPosition.z;
  loggerService.debug('Entering movePosition…');
  loggerService.debug(
    `Distances: X-axis=${distanceX}, Y-axis=${distanceY}, Z-axis=${distanceZ}`,
  );
  const distanceBetweenTargetAndCurrent = Math.sqrt(
    distanceX ** 2 + distanceY ** 2 + distanceZ ** 2,
  );
  loggerService.debug(`Total distance ${distanceBetweenTargetAndCurrent}`);
  if (distanceBetweenTargetAndCurrent === 0) {
    return currentPosition;
  }
  const deltaX =
    (distancePerTick * distanceX) / distanceBetweenTargetAndCurrent;
  const deltaY =
    (distancePerTick * distanceY) / distanceBetweenTargetAndCurrent;
  const deltaZ =
    (distancePerTick * distanceZ) / distanceBetweenTargetAndCurrent;
  loggerService.debug(
    `Delta per tick: X-axis=${deltaX}, Y-axis=${deltaY}, Z-axis=${deltaZ}`,
  );
  const newX = currentPosition.x + deltaX;
  const newY = currentPosition.y + deltaY;
  const newZ = currentPosition.z + deltaZ;
  loggerService.debug(
    `New coordinates (before cut-off): X-axis=${newX}, Y-axis=${newY}, Z-axis=${newZ}`,
  );
  return {
    x:
      deltaX > 0
        ? newX > targetPosition.x
          ? targetPosition.x
          : newX
        : newX < targetPosition.x
        ? targetPosition.x
        : newX,
    y:
      deltaY > 0
        ? newY > targetPosition.y
          ? targetPosition.y
          : newY
        : newY < targetPosition.y
        ? targetPosition.y
        : newY,
    z:
      deltaZ > 0
        ? newZ > targetPosition.z
          ? targetPosition.z
          : newZ
        : newZ < targetPosition.z
        ? targetPosition.z
        : newZ,
  };
};

export const isSamePosition = (positionA: Position, positionB: Position) =>
  positionA.x === positionB.x &&
  positionA.y === positionB.y &&
  positionA.z === positionB.z;

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
  const newPosition: Position = movePosition({ loggerService })({
    currentPosition,
    distancePerTick: DISTANCE_PER_TICK,
    targetPosition: targetCoordinates,
  });
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
  ).then(() => {
    if (!isSamePosition(currentPosition, targetCoordinates)) {
      return timeService.addAction(
        createDisplacement({ loggerService })({
          displacementId,
          entityId,
          targetCoordinates,
        }),
      );
    }
  });
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
