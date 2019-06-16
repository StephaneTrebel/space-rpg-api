import { LoggerService } from '../../../services/logger/types';
import { HandlerResponse } from '../../../services/openapi-backend/types';
import { TimeService } from '../../../services/time/types';

import { Id } from '../../../utils/id/types';

import { getPropertyFromContextBody } from '../../../utils/context/utils';
import { createDisplacement } from '../../../utils/displacememt/utils';
import { Position } from '../../../utils/position/types';

type StartDisplacement = (deps: {
  loggerService: LoggerService;
  testId?: Id;
  timeService: TimeService;
}) => (context: any) => HandlerResponse;
export const startDisplacement: StartDisplacement = ({
  loggerService,
  testId,
  timeService,
}) => context => {
  loggerService.debug('Entering startDisplacement…');
  const entityId = getPropertyFromContextBody('entityId')(context);
  const displacement = createDisplacement({ loggerService })({
    displacementId: testId,
    entityId,
    targetCoordinates: getPropertyFromContextBody('targetCoordinates')(
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
};
