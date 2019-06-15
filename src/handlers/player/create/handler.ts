import { LoggerService } from '../../../services/logger/types';
import { HandlerResponse } from '../../../services/openapi-backend/types';
import {
  StateMutation,
  StateService,
} from '../../../services/state/types';

import { EntityType } from '../../../utils/entity/types';

import { SELF_HEALTH_LINK } from '../../miscellaneous/self-health/handler';

import { createEntity } from '../../../utils/entity/utils';

type AddPlayer = (deps: {
  loggerService: LoggerService;
  stateService: StateService;
}) => (context: any) => HandlerResponse;
export const addNewPlayer: AddPlayer = deps => context => {
  const username = context.request && context.request.requestBody.username;
  const newPlayer = createEntity({
    currentPosition: { x: 0, y: 0, z: 0 },
    type: EntityType.PLAYER,
    username,
  });
  deps.stateService.mutate(StateMutation.CREATE_PLAYER)(newPlayer);
  return {
    json: {
      links: [SELF_HEALTH_LINK],
      player: newPlayer,
    },
    status: 201,
  };
};
