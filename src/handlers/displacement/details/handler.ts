import { LoggerService } from '../../../services/logger/types';
import { AsyncHandler } from '../../../services/openapi-backend/types';
import { TimeService } from '../../../services/time/types';

import { Displacement } from '../../../utils/displacememt/types';
import { Id } from '../../../utils/id/types';
import { wrapHandler } from '../../../services/openapi-backend/service';
import { getPropertyFromContextRequest } from '../../../utils/context/utils';
import { getDisplacementText } from '../../../utils/displacememt/utils';

type GetDisplacementFromTimeService = (deps: {
	loggerService: LoggerService;
	timeService: TimeService;
}) => (params: { id: Id }) => Displacement;
export const getDisplacementFromTimeService: GetDisplacementFromTimeService = ({
	loggerService,
	timeService,
}) => ({ id }) => {
	loggerService.debug('Entering getDisplacementFromTimeService…');
	const maybeAction = timeService.findAction(id);
	if (maybeAction) {
		loggerService.debug(
			`Displacement retrieved for id '${id}': ${JSON.stringify(maybeAction)}`,
		);
		return maybeAction as Displacement;
	}
	throw new Error(`No displacement with id ${id}`);
};

type GetDisplacement = (deps: {
	loggerService: LoggerService;
	timeService: TimeService;
}) => AsyncHandler;
export const getDisplacement: GetDisplacement = ({
	loggerService,
	timeService,
}) =>
	wrapHandler({ loggerService })((context: any) => {
		loggerService.debug('Entering getDisplacement handler…');
		const displacement = getDisplacementFromTimeService({
			loggerService,
			timeService,
		})({
			id: getPropertyFromContextRequest('id')(context) as Id,
		});
		return {
			json: {
				displacement,
				links: [],
				text: getDisplacementText({ loggerService })({ displacement }),
			},
			status: 200,
		};
	});
