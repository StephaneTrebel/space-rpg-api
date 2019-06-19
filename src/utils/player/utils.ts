import { LoggerService } from '../../services/logger/types';
import { State, StateService } from '../../services/state/types';

import { EntityType } from '../../utils/entity/types';
import { createEntity } from '../entity/utils';
import { Id } from '../../utils/id/types';
import { Player, PlayerCreationParams } from '../../utils/player/types';

export const MOCK_PLAYER: Player = {
  currentPosition: {
    x: 0,
    y: 0,
    z: 0,
  },
  id: 'mockPlayer',
  type: EntityType.PLAYER,
  username: 'foo',
};

export const createPlayer = (params: PlayerCreationParams) =>
  createEntity(EntityType.PLAYER)(params) as Player;

export const createPlayerMutator = (currentState: State) => (
  newPlayer: Player,
): State => ({
  ...currentState,
  entityList: [...currentState.entityList, newPlayer],
});

type GetPlayerFromStateService = (deps: {
  loggerService: LoggerService;
  stateService: StateService;
}) => (params: { id: Id }) => Player;
export const getPlayerFromStateService: GetPlayerFromStateService = ({
  loggerService,
  stateService,
}) => ({ id }) => {
  loggerService.debug('Entering getPlayerFromStateService…');
  const entity = stateService.findEntity({
    id,
  }) as Player;
  loggerService.debug(
    `Player retrieved for id '${id}': ${JSON.stringify(entity)}`,
  );
  return entity;
};
