import { LoggerService } from '../../../services/logger/types';
import { HandlerResponse } from '../../../services/openapi-backend/types';
import { TimeService } from '../../../services/time/types';

import { Id } from '../../../utils/id/types';
import { generateId } from '../../../utils/id/utils';

import { getPropertyFromContextBody } from '../../../utils/context/utils';
import { createDisplacement } from '../../../utils/displacememt/utils';
import { StateService } from '../../../services/state/types';

type TravelToEntity = (deps: {
  loggerService: LoggerService;
  stateService: StateService;
  timeService: TimeService;
}) => (context: any) => HandlerResponse;
export const travelToEntity: TravelToEntity = ({
  loggerService,
  stateService,
  timeService,
}) => context => {
  try {
    loggerService.debug('Entering travelToEntity…');
    const entityId = getPropertyFromContextBody('entityId')(context) as Id;
    const displacement = createDisplacement({ loggerService, stateService })({
      displacementId: generateId(),
      entityId,
      target: getPropertyFromContextBody('targetId')(context) as Id,
    });
    timeService.addAction(displacement);
    return {
      json: {
        displacementId: displacement.id,
        links: [
          {
            href: `/displacement/${displacement.id}`,
            rel: 'details',
          },
        ],
      },
      status: 201,
    };
  } catch (error) {
    loggerService.error(
      `Error encountered in travelToEntity handler: ${error.message}`,
    );
    return {
      json: {
        code: 'travelToEntityError',
        message: `Error encountered: ${error.message}`,
      },
      status: 400,
    };
  }
};
