import * as uuid from 'uuid';

import { Id } from './types';

export const isId = (x: any): x is Id => typeof x === 'string';

export const generateId = () => uuid.v4();
