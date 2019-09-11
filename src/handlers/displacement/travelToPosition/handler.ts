import { LoggerService } from '../../../services/logger/types';
import { wrapHandler } from '../../../services/openapi-backend/service';
import { AsyncHandler } from '../../../services/openapi-backend/types';
import { StateService } from '../../../services/state/types';
import { TimeService } from '../../../services/time/types';

import { getPropertyFromContextBody } from '../../../utils/context/utils';
import {
	createDisplacement,
	getDisplacementText,
} from '../../../utils/displacememt/utils';
import { Id } from '../../../utils/id/types';
import { Position } from '../../../utils/position/types';

type TravelToPosition = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
	testId?: Id;
	timeService: TimeService;
}) => AsyncHandler;
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
				text: getDisplacementText({ loggerService })({ displacement }),
			},
			status: 201,
		};
	});
