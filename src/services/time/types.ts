import { Subscription } from 'rxjs';

import { Displacement } from '../../handlers/displacement/types';
import { Id } from '../../types/id';

import { ConfigService } from '../config/types';
import { LoggerService } from '../logger/types';
import { StateService } from '../state/types';

import { GetActionParams } from './service';
import { TimeService } from './types';

export type Executor = (params: {
  loggerService: LoggerService;
  stateService: StateService;
  timeService: TimeService;
}) => Promise<any>;

export enum ActionType {
  NONE = 'none', // No action should ever have this type. For tests only
  MOCK = 'mock', // Mock actions only
  DISPLACEMENT = 'displacement',
}

export interface BaseAction {
  executor: Executor;
  id: Id;
  type: ActionType.MOCK;
}
export type Action = BaseAction | Displacement;
export type ActionList = Array<Action>;

export interface TimeConfig {
  period?: number;
  startDelay?: number;
}

export interface TimeService {
  addAction: (action: Action) => void;
  getAction: (params: GetActionParams) => Action;
  start: () => Subscription;
  stop: () => void;
}

export type TimeServiceFactory = (deps: {
  configService: ConfigService;
  loggerService: LoggerService;
  stateService: StateService;
}) => (initialActionQueue?: ActionList | undefined) => TimeService;
