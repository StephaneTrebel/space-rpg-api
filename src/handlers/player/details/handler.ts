import { LoggerService } from '../../../services/logger/types';
import { wrapHandler } from '../../../services/openapi-backend/service';
import { Handler } from '../../../services/openapi-backend/types';
import { StateService } from '../../../services/state/types';

import { getPropertyFromContextRequest } from '../../../utils/context/utils';
import { getPlayerFromStateService } from '../../../utils/player/utils';

type GetPlayerDetails = (deps: {
  loggerService: LoggerService;
  stateService: StateService;
}) => Handler;
export const getPlayerDetails: GetPlayerDetails = ({
  loggerService,
  stateService,
}) =>
  wrapHandler({ loggerService })((context: any) => {
    loggerService.debug('Entering getPlayerDetails handler…');
    const player = getPlayerFromStateService({
      loggerService,
      stateService,
    })({
      id: getPropertyFromContextRequest('id')(context),
    });
    return { json: { links: [], player }, status: 200 };
  });
