import { LoggerService } from '../../../services/logger/types';
import { wrapHandler } from '../../../services/openapi-backend/service';
import { Handler } from '../../../services/openapi-backend/types';
import { StateService } from '../../../services/state/types';
import { TimeService } from '../../../services/time/types';

import { getPropertyFromContextBody } from '../../../utils/context/utils';
import { createDisplacement } from '../../../utils/displacememt/utils';
import { Id } from '../../../utils/id/types';
import { generateId } from '../../../utils/id/utils';

type TravelToEntity = (deps: {
  loggerService: LoggerService;
  stateService: StateService;
  timeService: TimeService;
}) => Handler;
export const travelToEntity: TravelToEntity = ({
  loggerService,
  stateService,
  timeService,
}) =>
  wrapHandler({ loggerService })((context: any) => {
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
  });
