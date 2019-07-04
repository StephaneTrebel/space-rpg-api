import { LoggerService } from '../../../services/logger/types';
import { wrapHandler } from '../../../services/openapi-backend/service';
import { Handler } from '../../../services/openapi-backend/types';
import { StateMutation, StateService } from '../../../services/state/types';

import { SELF_HEALTH_LINK } from '../../miscellaneous/self-health/handler';

import { createPlayer } from '../../../utils/player/utils';

type AddPlayer = (deps: {
  loggerService: LoggerService;
  stateService: StateService;
}) => Handler;
export const addNewPlayer: AddPlayer = ({ loggerService, stateService }) =>
  wrapHandler({ loggerService })((context: any) => {
    const name = context.request && context.request.requestBody.name;
    const newPlayer = createPlayer({
      currentPosition: { x: 0, y: 0, z: 0 },
      name,
    });
    stateService.mutate({
      mutation: StateMutation.CREATE_PLAYER,
      payload: newPlayer,
    });
    return {
      json: {
        links: [SELF_HEALTH_LINK],
        player: newPlayer,
      },
      status: 201,
    };
  });
