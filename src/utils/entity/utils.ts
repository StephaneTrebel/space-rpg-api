import * as uuid from 'uuid';

import { Id } from '../id/types';
import { Planet } from '../planet/types';
import { Position } from '../position/types';

import { Entity, EntityType, BaseEntity } from './types';
import { Player } from '../../handlers/player/types';

export const MOCK_ENTITY: BaseEntity = {
  currentPosition: {
    x: 0,
    y: 0,
    z: 0,
  },
  id: 'mockEntity',
  type: EntityType.MOCK,
};

type CreateEntity = (params: {
  currentPosition: Position;
  id?: Id;
  name?: string;
  username?: string;
  type: EntityType;
}) => Entity;
export const createEntity: CreateEntity = ({
  currentPosition,
  id,
  name,
  username,
  type,
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
