import { LoggerService } from '../../../services/logger/types';
import { wrapHandler } from '../../../services/openapi-backend/service';
import { AsyncHandler } from '../../../services/openapi-backend/types';
import { StateMutation, StateService } from '../../../services/state/types';

import { SELF_HEALTH_LINK } from '../../miscellaneous/self-health/handler';

import { Player } from '../../../utils/player/types';
import { createPlayer } from '../../../utils/player/utils';
import { Spaceship } from '../../../utils/spaceship/types';
import { createSpaceship } from '../../../utils/spaceship/utils';

type AddNewPlayer = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => (params: {
	name: string;
}) => Promise<{ newPlayer: Player; newSpaceship: Spaceship }>;
export const addNewPlayer: AddNewPlayer = ({
	loggerService,
	stateService,
}) => ({ name }) => {
	loggerService.debug('Entering addNewPlayer...');
	const newPlayer = createPlayer({
		currentPosition: { x: 0, y: 0, z: 0 },
		name,
	});
	const newSpaceship = createSpaceship({
		currentPosition: { x: 0, y: 0, z: 0 },
		name: name + `'s spaceship`,
		onBoard: [newPlayer],
	});
	return Promise.all([
		stateService.mutate({
			mutation: StateMutation.CREATE_PLAYER,
			payload: newPlayer,
		}),
		stateService.mutate({
			mutation: StateMutation.CREATE_SPACESHIP,
			payload: newSpaceship,
		}),
	]).then(() => ({ newPlayer, newSpaceship }));
};

type AddNewPlayerHandler = (deps: {
	loggerService: LoggerService;
	stateService: StateService;
}) => AsyncHandler;
export const addNewPlayerHandler: AddNewPlayerHandler = ({
	loggerService,
	stateService,
}) =>
	wrapHandler({ loggerService })((context: any) => {
		const name = context.request && context.request.requestBody.name;
		return addNewPlayer({ loggerService, stateService })({ name }).then(
			({ newPlayer, newSpaceship }) => ({
				json: {
					links: [SELF_HEALTH_LINK],
					player: newPlayer,
					spaceship: newSpaceship,
				},
				status: 201,
			}),
		);
	});
