import { LoggerService } from '../../../services/logger/types';
import { HandlerResponse } from '../../../services/openapi-backend/types';
import { StateService } from '../../../services/state/types';

import { getPropertyFromContextRequest } from '../../../utils/context/utils';
import { getPlayerFromStateService } from '../../../utils/player/utils';

type GetPlayerDetails = (deps: {
  loggerService: LoggerService;
  stateService: StateService;
}) => (context: any) => HandlerResponse;
export const getPlayerDetails: GetPlayerDetails = ({
  loggerService,
  stateService,
}) => context => {
  try {
    loggerService.debug('Entering getPlayerDetails handler…');
    const player = getPlayerFromStateService({
      loggerService,
      stateService,
    })({
      id: getPropertyFromContextRequest('id')(context),
    });
    return { json: { links: [], player }, status: 200 };
  } catch (error) {
    loggerService.error(
      `Error encountered in getPlayerDetails handler: ${error.message}`,
    );
    return {
      json: {
        code: 'getPlayerDetailsError',
        message: `Error encountered: ${error.message}`,
      },
      status: 400,
    };
  }
};
