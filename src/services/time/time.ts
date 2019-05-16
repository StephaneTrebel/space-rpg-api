import { Subscription, timer } from 'rxjs';

import { ConfigService } from '../config/config';
import { LoggerService } from '../logger/logger';
import { StateService } from '../state/state';

export type Action = (s: StateService) => Promise<any>;
export type ActionList = Array<Action>;

export interface TimeService {
  addAction: (b: Action) => void;
  start: () => Subscription;
  stop: () => void;
}

export interface TimeConfig {
  startDelay: number;
  period: number;
}

export const getTimeConfig = (configService: ConfigService): TimeConfig =>
  configService.get('time');

export type TimeServiceFactory = (deps: {
  configService: ConfigService;
  loggerService: LoggerService;
  stateService: StateService;
}) => TimeService;
export const timeServiceFactory: TimeServiceFactory = ({
  configService,
  loggerService,
  stateService,
}): TimeService => {
  const internal: { actionQueue: ActionList; timer?: Subscription } = {
    actionQueue: [],
  };
  const timeConfig = getTimeConfig(configService);
  return {
    addAction: (action: Action) =>
      (internal.actionQueue = [...internal.actionQueue, action]),
    start: () =>
      (internal.timer = timer(
        timeConfig.startDelay,
        timeConfig.period,
      ).subscribe(() => {
        loggerService.debug('Tic-toc !');
        return Promise.all(
          internal.actionQueue.map(action => action(stateService)),
        ).then(() => (internal.actionQueue = []));
      })),
    stop: () => internal.timer && internal.timer.unsubscribe(),
  };
};
