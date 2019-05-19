import { Context } from 'openapi-backend/backend';
import { Response } from 'express-serve-static-core';

import { TimeService, ActionType } from '../../services/time/types';

import { Displacement } from './types';

export const getDisplacementIdFromContext = (context: Context): string => {
  const id =
    context.request && context.request.params && context.request.params.id;
  if (!!id && typeof id === 'string') {
    return id;
  }
  throw new Error(`Cannot retrieve displacement id from context`);
};

export const getDisplacementFromTimeService = ({
  timeService,
  id,
}: {
  timeService: TimeService;
  id: string;
}): Displacement => {
  const action = timeService.getAction(id);
  if (!!action && action.type === ActionType.DISPLACEMENT) {
    return action;
  }
  throw new Error(`No displacement with id "${id}"`);
};

export const sendResponse = (res: Response) => (displacement: Displacement) =>
  res.status(200).json({
    displacement,
    links: [],
  });

export const getDisplacement = (deps: { timeService: TimeService }) => (
  context: Context,
  _req: any,
  res: Response,
) => {
  const displacement = getDisplacementFromTimeService({
    id: getDisplacementIdFromContext(context),
    timeService: deps.timeService,
  });
  sendResponse(res)(displacement);
};

export const createDisplacementMock: () => Displacement = () => ({
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
});
