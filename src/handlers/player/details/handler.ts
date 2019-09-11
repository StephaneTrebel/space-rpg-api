import { LoggerService } from '../../../services/logger/types';
import { wrapHandler } from '../../../services/openapi-backend/service';
import { AsyncHandler } from '../../../services/openapi-backend/types';
import { StateService } from '../../../services/state/types';

import { getPropertyFromContextRequest } from '../../../utils/context/utils';
import { getPlayerFromStateService } from '../../../utils/player/utils';
import { Player } from '../../../utils/player/types';

type GetPlayerDetailsText = (deps: {
	loggerService: LoggerService;
}) => (params: { player: Player }) => string;
export const getPlayerDetailsText: GetPlayerDetailsText = ({
	loggerService,
}) => ({ player }) => {
	loggerService.debug('Entering getPlayerDetailsText...');
	return `${
		player.name
	} is not quite known across the galaxy, but that is very likely to change in the future...`;
};

type GetPlayerDetails = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => AsyncHandler;
export const getPlayerDetails: GetPlayerDetails = ({
	loggerService,
	stateService,
}) =>
	wrapHandler({ loggerService })((context: any) => {
		loggerService.debug('Entering getPlayerDetails handler…');
		const id = getPropertyFromContextRequest('id')(context);
		const player = getPlayerFromStateService({
			loggerService,
			stateService,
		})({
			id,
		});
		return {
			json: {
				links: [],
				nearby: stateService.getNearbyEntities({ id }),
				player,
				text: getPlayerDetailsText({ loggerService })({ player }),
			},
			status: 200,
		};
	});
