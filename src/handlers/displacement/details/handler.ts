import { LoggerService } from '../../../services/logger/types';
import { HandlerResponse } from '../../../services/openapi-backend/types';
import { TimeService, ActionType } from '../../../services/time/types';

import { Displacement } from '../../../utils/displacememt/types';
import { Id } from '../../../utils/id/types';

export const MOCK_DISPLACEMENT: Displacement = {
  entityId: 'foo',
  executor: () => Promise.resolve(),
  id: 'bar',
  targetCoordinates: {
    x: 0,
    y: 0,
    z: 0,
  },
  type: ActionType.DISPLACEMENT,
};
export const createDisplacementMock = ({
  entityId,
  executor,
  id,
  targetCoordinates,
  type,
}: Displacement = MOCK_DISPLACEMENT): Displacement => ({
  entityId,
  executor,
  id,
  targetCoordinates,
  type,
});

export const getDisplacementIdFromContext = (context: any): string =>
  context.request &&
  context.request.params &&
  // Params have a weird type, but at runtime openapi-backend will check them
  // accordingly, so no need for additionnal code here
  (context.request.params.id as any);

type GetDisplacementFromTimeService = (deps: {
  loggerService: LoggerService;
  timeService: TimeService;
}) => (params: { id: Id }) => Displacement;
export const getDisplacementFromTimeService: GetDisplacementFromTimeService = ({
  loggerService,
  timeService,
}) => ({ id }) => {
  loggerService.debug('Entering getDisplacementFromTimeService…');
  const action = timeService.findAction({ id });
  loggerService.debug(
    `Displacement retrieved for id '${id}': ${JSON.stringify(action)}`,
  );
  return action as Displacement;
};

type GetDisplacement = (deps: {
  loggerService: LoggerService;
  timeService: TimeService;
}) => (context: any) => HandlerResponse;
export const getDisplacement: GetDisplacement = ({
  loggerService,
  timeService,
}) => context => {
  try {
    loggerService.debug('Entering getDisplacement handler…');
    const displacement = getDisplacementFromTimeService({
      loggerService,
      timeService,
    })({
      id: getDisplacementIdFromContext(context),
    });
    return { json: { links: [], displacement }, status: 200 };
  } catch (error) {
    loggerService.error(
      `Error encountered in getDisplacement handler: ${error.message}`,
    );
    return {
      json: {
        code: 'getDisplacementError',
        message: `Error encountered: ${error.message}`,
      },
      status: 400,
    };
  }
};