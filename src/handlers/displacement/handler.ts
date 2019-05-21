import { Context } from 'openapi-backend/backend';
import { Response } from 'express-serve-static-core';

import { TimeService, ActionType } from '../../services/time/types';
import { sendResponse } from '../../services/webserver/service';

import { Displacement } from './types';

export const MOCK_DISPLACEMENT: Displacement = {
  currentPosition: {
    x: 0,
    y: 0,
    z: 0,
  },
  executor: () => Promise.resolve(),
  id: 'foo',
  targetCoordinates: {
    x: 0,
    y: 0,
    z: 0,
  },
  type: ActionType.DISPLACEMENT,
};
export const createDisplacementMock = ({
  currentPosition,
  executor,
  id,
  targetCoordinates,
  type,
}: Displacement = MOCK_DISPLACEMENT): Displacement => ({
  currentPosition,
  executor,
  id,
  targetCoordinates,
  type,
});

export const getDisplacementIdFromContext = (context: Context): string =>
  context.request &&
  context.request.params &&
  // Params have a weird type, but at runtime openapi-backend will check them
  // accordingly, so no need for additionnal code here
  (context.request.params.id as any);

export const getDisplacementFromTimeService = ({
  id,
  timeService,
}: {
  id: string;
  timeService: TimeService;
}): Displacement => {
  const action = timeService.getAction(id);
  if (!!action && action.type === ActionType.DISPLACEMENT) {
    return action;
  }
  throw new Error(`No displacement with id "${id}"`);
};

export const getDisplacement = (deps: { timeService: TimeService }) => (
  context: Context,
  _req: any,
  res: Response,
) => {
  try {
    const displacement = getDisplacementFromTimeService({
      id: getDisplacementIdFromContext(context),
      timeService: deps.timeService,
    });
    sendResponse(res)({ links: [], payload: displacement, status: 200 });
  } catch (error) {
    sendResponse(res)({
      payload: {
        code: 'getDisplacementError',
        message: `Error encountered: ${error.message}`,
      },
      status: 400,
    });
  }
};
