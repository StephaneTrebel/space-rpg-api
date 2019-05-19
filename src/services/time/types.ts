import { Subscription } from 'rxjs';

import { Displacement } from '../../handlers/displacement/types';
import { Id } from '../../types/id';

import { ConfigService } from '../config/types';
import { LoggerService } from '../logger/types';
import { StateService } from '../state/service';

export type Executor = (s: StateService) => Promise<any>;

export enum ActionType {
  BASE = 'base',
  DISPLACEMENT = 'displacement',
}

export interface BaseAction {
  executor: Executor;
  id: Id;
  type: ActionType.BASE;
}
export type Action = BaseAction | Displacement;
export type ActionList = Array<Action>;

export interface TimeConfig {
  period?: number;
  startDelay?: number;
}

export interface TimeService {
  addAction: (action: Action) => void;
  getAction: (id: Id) => Action;
  start: () => Subscription;
  stop: () => void;
}

export type TimeServiceFactory = (deps: {
  configService: ConfigService;
  loggerService: LoggerService;
  stateService: StateService;
}) => TimeService;
