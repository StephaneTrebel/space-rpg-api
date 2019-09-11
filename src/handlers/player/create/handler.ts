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

type GetNewPlayerText = (deps: {
	loggerService: LoggerService;
}) => (params: { newPlayer: Player; newSpaceship: Spaceship }) => string;
export const getNewPlayerText: GetNewPlayerText = ({ loggerService }) => ({
	newPlayer,
	newSpaceship,
}) => {
	loggerService.debug('Entering getNewPlayerText...');
	return `You hear a buzz, and open your eyes. An employee helps you getting outside the Clone-O-Tron and explains you the basics for the umpteenth time: You weren't, and yet now you are. The scientific mumbo-jumbo glosses over you as your brain adapts to your new existence and suddenly a card key falls onto your lap: "Your spaceship awaits...err, ${
		newPlayer.name
	}, is it ? Time to take your brand new spaceship, that have been baptized ${
		newSpaceship.name
	} and to go wherever you want. The universe is your oyster, yaddi-yadda, you know the drill. Well you obviously don't. Have fun !"`;
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
					text: getNewPlayerText({ loggerService })({
						newPlayer,
						newSpaceship,
					}),
				},
				status: 201,
			}),
		);
	});
