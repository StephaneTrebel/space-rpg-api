import { LoggerService } from '../../../services/logger/types';
import { wrapHandler } from '../../../services/openapi-backend/service';
import { AsyncHandler } from '../../../services/openapi-backend/types';
import { StateService } from '../../../services/state/types';

import { getPropertyFromContextRequest } from '../../../utils/context/utils';
import { Entity } from '../../../utils/entity/types';
import { Id } from '../../../utils/id/types';
import { getEntityDetailsText } from '../../../utils/entity/utils';

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

type GetEntityDetailsHandler = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => AsyncHandler;
export const getEntityDetailsHandler: GetEntityDetailsHandler = ({
	loggerService,
	stateService,
}) =>
	wrapHandler({ loggerService })((context: any) => {
		loggerService.debug('Entering getEntity handler…');
		const entity = getEntityFromStateService({
			loggerService,
			stateService,
		})({
			id: getPropertyFromContextRequest('id')(context) as Id,
		});
		return {
			json: {
				entity,
				links: [],
				text: getEntityDetailsText({ entity }),
			},
			status: 200,
		};
	});
