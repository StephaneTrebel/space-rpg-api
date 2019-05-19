import { Subscription, timer } from 'rxjs';

import { Id } from '../../types/id';

import { ConfigService } from '../config/types';

import {
  Action,
  ActionList,
  ActionType,
  BaseAction,
  Executor,
  TimeConfig,
  TimeService,
  TimeServiceFactory,
} from './types';

export const getTimeConfig = (configService: ConfigService): TimeConfig =>
  configService.get('time');

export const addAction = (actionQueue: ActionList) => (action: Action) => [
  ...actionQueue,
  action,
];

export const createTimer: (
  timeConfig?: TimeConfig,
) => (fn: () => void) => Subscription = (timeConfig = {}) => fn =>
  timer(timeConfig.startDelay, timeConfig.period).subscribe(fn);

export const getAction = (actionList: ActionList) => (id: Id) => {
  const maybeAction = actionList.find(action => action.id === id);
  if (!!maybeAction) {
    return maybeAction;
  }
  throw new Error(`Cannot find action with id ${id}`);
};

export const timeServiceFactory: TimeServiceFactory = ({
  configService,
  loggerService,
  stateService,
}): TimeService => {
  const internal: { actionQueue: ActionList; timer?: Subscription } = {
    actionQueue: [],
  };
  return {
    addAction: (action: Action) =>
      (internal.actionQueue = addAction(internal.actionQueue)(action)),
    getAction: getAction(internal.actionQueue),
    start: () =>
      (internal.timer = createTimer(getTimeConfig(configService))(() => {
        loggerService.debug('Tic-toc !');
        return Promise.all(
          internal.actionQueue.map(action => action.executor(stateService)),
        ).then(() => (internal.actionQueue = []));
      })),
    stop: () => internal.timer && internal.timer.unsubscribe(),
  };
};

export const createBaseActionMock = ({
  id,
  executor,
}: {
  id: string;
  executor: Executor;
}): BaseAction => ({
  executor,
  id,
  type: ActionType.BASE,
});
