import { LoggerService } from '../../../services/logger/types';
import { wrapHandler } from '../../../services/openapi-backend/service';
import { Handler } from '../../../services/openapi-backend/types';
import { StateService } from '../../../services/state/types';

import { getPropertyFromContextRequest } from '../../../utils/context/utils';
import { Entity } from '../../../utils/entity/types';
import { Id } from '../../../utils/id/types';

type GetEntityFromStateService = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => (params: { id: Id }) => Entity;
export const getEntityFromStateService: GetEntityFromStateService = ({
	loggerService,
	stateService,
}) => ({ id }) => {
	loggerService.debug('Entering getEntityFromStateService…');
	const action = stateService.findEntity({ id });
	loggerService.debug(
		`Entity retrieved for id '${id}': ${JSON.stringify(action)}`,
	);
	return action as Entity;
};

type GetEntityDetails = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => Handler;
export const getEntityDetails: GetEntityDetails = ({
	loggerService,
	stateService,
}) =>
	wrapHandler({ loggerService })(context => {
		loggerService.debug('Entering getEntity handler…');
		const entity = getEntityFromStateService({
			loggerService,
			stateService,
		})({
			id: getPropertyFromContextRequest('id')(context) as Id,
		});
		return { json: { links: [], entity }, status: 200 };
	});
