import * as uuid from 'uuid';

import { Id } from '../id/types';
import { Planet } from '../planet/types';
import { Player } from '../player/types';
import { Position } from '../position/types';

import { Entity, EntityType, BaseEntity } from './types';

export const MOCK_ENTITY: BaseEntity = {
  currentPosition: {
    x: 0,
    y: 0,
    z: 0,
  },
  id: 'mockEntity',
  type: EntityType.MOCK,
};

type CreateEntity = (
  type: EntityType,
) => (params: {
  currentPosition: Position;
  id?: Id;
  name?: string;
  username?: string;
}) => Entity;
export const createEntity: CreateEntity = type => ({
  currentPosition,
  id,
  name,
  username,
}) => {
  const newId: Id = id || uuid.v4();
  switch (type) {
    case EntityType.NONE:
      throw new Error('No entity of type None can be created');
    case EntityType.MOCK:
      return {
        currentPosition,
        id: newId,
        type,
      } as BaseEntity;
    case EntityType.PLANET:
      return {
        currentPosition,
        id: newId,
        name,
        type,
      } as Planet;
    case EntityType.PLAYER:
      return {
        currentPosition,
        id: newId,
        type,
        username,
      } as Player;
  }
};
