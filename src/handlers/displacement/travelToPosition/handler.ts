import { LoggerService } from '../../../services/logger/types';
import { HandlerResponse } from '../../../services/openapi-backend/types';
import { TimeService } from '../../../services/time/types';

import { Id } from '../../../utils/id/types';

import { getPropertyFromContextBody } from '../../../utils/context/utils';
import { createDisplacement } from '../../../utils/displacememt/utils';
import { Position } from '../../../utils/position/types';
import { StateService } from '../../../services/state/types';

type TravelToPosition = (deps: {
  loggerService: LoggerService;
  stateService: StateService;
  testId?: Id;
  timeService: TimeService;
}) => (context: any) => HandlerResponse;
export const travelToPosition: TravelToPosition = ({
  loggerService,
  stateService,
  testId,
  timeService,
}) => context => {
  try {
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
  } catch (error) {
    loggerService.error(
      `Error encountered in travelToPosition handler: ${error.message}`,
    );
    return {
      json: {
        code: 'travelToPositionError',
        message: `Error encountered: ${error.message}`,
      },
      status: 400,
    };
  }
};
