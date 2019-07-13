import { EntityType } from '../../utils/entity/types';
import { createEntity } from '../entity/utils';
import { Position } from '../position/types';
import { Id } from '../../utils/id/types';

import { Planet } from './types';

export const createPlanet = (params: {
  currentPosition?: Position;
  id?: Id;
  name?: string;
}) =>
  createEntity(EntityType.PLANET)({
    currentPosition: params.currentPosition || {
      x: 0,
      y: 0,
      z: 0,
    },
    id: params.id || 'mockPlanet',
    name: params.name || 'foo',
  }) as Planet;
