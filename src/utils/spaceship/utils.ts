import { LoggerService } from '../../services/logger/types';
import { State, StateService } from '../../services/state/types';

import { EntityType } from '../../utils/entity/types';
import { createEntity } from '../entity/utils';
import { Position } from '../position/types';
import { Id } from '../../utils/id/types';
import {
  BoardableEntity,
  BoardableEntityList,
  Spaceship,
} from '../../utils/spaceship/types';

export const createSpaceship = (params: {
  currentPosition?: Position;
  fuel?: number;
  id?: Id;
  name?: string;
  onBoard?: BoardableEntityList;
}): Spaceship => createEntity(EntityType.SPACESHIP)(params) as Spaceship;

export const createSpaceshipMutator = (currentState: State) => (
  newSpaceship: Spaceship,
): State => ({
  ...currentState,
  entityList: [...currentState.entityList, newSpaceship],
});

type GetSpaceshipFromStateService = (deps: {
  loggerService: LoggerService;
  stateService: StateService;
}) => (params: { id: Id }) => Spaceship;
export const getSpaceshipFromStateService: GetSpaceshipFromStateService = ({
  loggerService,
  stateService,
}) => ({ id }) => {
  loggerService.debug('Entering getSpaceshipFromStateService…');
  const entity = stateService.findEntity({
    id,
  }) as Spaceship;
  loggerService.debug(
    `Spaceship retrieved for id '${id}': ${JSON.stringify(entity)}`,
  );
  return entity;
};

type BoardSpaceship = (
  spaceship: Spaceship,
) => (entity: BoardableEntity) => Spaceship;
export const boardSpaceship: BoardSpaceship = spaceship => entity => {
  if (spaceship.onBoard.find(e => e.id === entity.id)) {
    throw new Error(
      `Entity '${entity.id}' in already on board spaceship '${spaceship.id}'`,
    );
  }
  return {
    ...spaceship,
    onBoard: [...spaceship.onBoard, entity],
  };
};
