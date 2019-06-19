import { LoggerService } from '../../../services/logger/types';
import { Handler } from '../../../services/openapi-backend/types';
import { TimeService } from '../../../services/time/types';

import { Id } from '../../../utils/id/types';

import { getPropertyFromContextBody } from '../../../utils/context/utils';
import { createDisplacement } from '../../../utils/displacememt/utils';
import { Position } from '../../../utils/position/types';
import { StateService } from '../../../services/state/types';
import { wrapHandler } from '../../../services/openapi-backend/service';

type TravelToPosition = (deps: {
  loggerService: LoggerService;
  stateService: StateService;
  testId?: Id;
  timeService: TimeService;
}) => Handler;
export const travelToPosition: TravelToPosition = ({
  loggerService,
  stateService,
  testId,
  timeService,
}) =>
  wrapHandler({ loggerService })((context: any) => {
    loggerService.debug('Entering travelToPosition…');
    const entityId = getPropertyFromContextBody('entityId')(context);
    const displacement = createDisplacement({ loggerService, stateService })({
      displacementId: testId,
      entityId,
      target: getPropertyFromContextBody('targetCoordinates')(
        context,
      ) as Position,
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
