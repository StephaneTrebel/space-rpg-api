import { State } from '../../services/state/types';

import { EntityType } from '../../utils/entity/types';
import { Player } from '../../utils/player/types';

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

export const createPlayerMutator = (currentState: State) => (
  newPlayer: Player,
): State => ({
  ...currentState,
  entityList: [...currentState.entityList, newPlayer],
});
