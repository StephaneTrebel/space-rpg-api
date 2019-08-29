import { LoggerService } from '../../../services/logger/types';
import { wrapHandler } from '../../../services/openapi-backend/service';
import { AsyncHandler } from '../../../services/openapi-backend/types';
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
	const action = stateService.findEntityById({ id });
	loggerService.debug(
		`Entity retrieved for id '${id}': ${JSON.stringify(action)}`,
	);
	return action as Entity;
};

type GetEntityDetails = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => AsyncHandler;
export const getEntityDetails: GetEntityDetails = ({
	loggerService,
	stateService,
}) =>
	wrapHandler({ loggerService })((context: any) => {
		loggerService.debug('Entering getEntity handler…');
		return {
			json: {
				entity: getEntityFromStateService({
					loggerService,
					stateService,
				})({
					id: getPropertyFromContextRequest('id')(context) as Id,
				}),
				links: [],
			},
			status: 200,
		};
	});
