import { Displacement } from '../../utils/displacememt/types';
import { Id } from '../../utils/id/types';

import { LoggerService } from '../logger/types';
import { StateService } from '../state/types';

import { TimeService } from './types';

export type Executor = (params: {
	loggerService: LoggerService;
	stateService: StateService;
	timeService: TimeService;
}) => Promise<any>;

export enum ActionType {
	NONE = 'none', // No action should ever have this type. For tests only
	DISPLACEMENT = 'displacement',
}

export type Action = Displacement;
export type ActionList = Array<Action>;

export interface TimeConfig {
	period?: number;
	startDelay?: number;
}

export interface TimeService {
	addAction: (action: Action) => void;
	cancelAction: (id: Id) => void;
	findAction: (id: Id) => Action | undefined;
	start: () => void;
	stop: () => void;
}
