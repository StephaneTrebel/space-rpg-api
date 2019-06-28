import { LoggerService } from '../../../services/logger/types';
import { Handler } from '../../../services/openapi-backend/types';
import { TimeService } from '../../../services/time/types';

import { Displacement } from '../../../utils/displacememt/types';
import { Id } from '../../../utils/id/types';
import { wrapHandler } from '../../../services/openapi-backend/service';
import { getPropertyFromContextRequest } from '../../../utils/context/utils';

type GetDisplacementFromTimeService = (deps: {
  loggerService: LoggerService;
  timeService: TimeService;
}) => (params: { id: Id }) => Displacement;
export const getDisplacementFromTimeService: GetDisplacementFromTimeService = ({
  loggerService,
  timeService,
}) => ({ id }) => {
  loggerService.debug('Entering getDisplacementFromTimeService…');
  const action = timeService.findAction(id);
  loggerService.debug(
    `Displacement retrieved for id '${id}': ${JSON.stringify(action)}`,
  );
  return action as Displacement;
};

type GetDisplacement = (deps: {
  loggerService: LoggerService;
  timeService: TimeService;
}) => Handler;
export const getDisplacement: GetDisplacement = ({
  loggerService,
  timeService,
}) =>
  wrapHandler({ loggerService })(context => {
    loggerService.debug('Entering getDisplacement handler…');
    const displacement = getDisplacementFromTimeService({
      loggerService,
      timeService,
    })({
      id: getPropertyFromContextRequest('id')(context) as Id,
    });
    return { json: { links: [], displacement }, status: 200 };
  });
