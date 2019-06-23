import { Subscription, timer } from 'rxjs';

import { Id } from '../../utils/id/types';

import { ConfigService } from '../config/types';
import { LoggerService } from '../logger/types';
import { StateService } from '../state/types';

import { Action, ActionList, TimeConfig, TimeService } from './types';

export const MOCK_TIME_CONFIG: TimeConfig = {
  period: 0,
  startDelay: 0,
};

export const getTimeConfig = (configService: ConfigService): TimeConfig =>
  configService.get('time');

type CreateTimer = (deps: {
  timerFn: typeof timer;
}) => (params: { timeConfig: TimeConfig; fn: () => void }) => Subscription;
export const createTimer: CreateTimer = ({ timerFn }) => ({ timeConfig, fn }) =>
  timerFn(timeConfig.startDelay, timeConfig.period).subscribe(fn);

interface TimeServiceInternal {
  actionQueue: ActionList;
  processQueue: ActionList;
  timer?: Subscription;
}

type FindAction = (deps: {
  loggerService: LoggerService;
}) => (internal: TimeServiceInternal) => (id: Id) => Action;
export const findAction: FindAction = ({ loggerService }) => (
  internal: TimeServiceInternal,
) => (id: Id) => {
  loggerService.debug(`Looking for action having id: ${JSON.stringify(id)}`);
  const maybeAction = internal.actionQueue.find(action => action.id === id);
  if (!maybeAction) {
    throw new Error(`Cannot find action with id '${id}'`);
  }
  return maybeAction;
};

export const addAction = (deps: { loggerService: LoggerService }) => (
  internal: TimeServiceInternal,
) => (action: Action) => {
  deps.loggerService.debug(
    `Adding action to internal action queue: ${JSON.stringify(action)}`,
  );
  return (internal.actionQueue = [...internal.actionQueue, action]);
};

export const cancelAction = (deps: { loggerService: LoggerService }) => (
  internal: TimeServiceInternal,
) => (id: Id) => {
  deps.loggerService.debug(`Cancelling action id: ${JSON.stringify(id)}`);
  return (internal.actionQueue = internal.actionQueue.filter(
    action => action.id !== id,
  ));
};

type Start = (deps: {
  configService: ConfigService;
  loggerService: LoggerService;
  stateService: StateService;
  timeService: TimeService;
  createTimerFn: typeof createTimer;
  timerFn: typeof timer;
}) => (internal: TimeServiceInternal) => () => void;
export const start: Start = ({
  configService,
  loggerService,
  stateService,
  timeService,
  createTimerFn,
  timerFn,
}) => (internal: TimeServiceInternal) => () => {
  loggerService.debug(`Starting time service`);
  internal.timer = createTimerFn({ timerFn })({
    fn: () => {
      internal.processQueue = [...internal.actionQueue];
      internal.actionQueue = [];
      return Promise.all(
        internal.processQueue.map(action =>
          action.executor({
            loggerService,
            stateService,
            timeService,
          }),
        ),
      );
    },
    timeConfig: getTimeConfig(configService),
  });
};

export const stop = (deps: { loggerService: LoggerService }) => (
  internal: TimeServiceInternal,
) => () => {
  deps.loggerService.debug(`Stopping time service`);
  if (internal.timer) {
    internal.timer.unsubscribe();
  }
};

export type TimeServiceFactory = (deps: {
  configService: ConfigService;
  loggerService: LoggerService;
  stateService: StateService;
}) => (initialActionQueue?: ActionList | undefined) => TimeService;
export const timeServiceFactory: TimeServiceFactory = deps => initialActionQueue => {
  const internal: TimeServiceInternal = {
    actionQueue: initialActionQueue || [],
    processQueue: [],
  };
  const timeService: TimeService = {
    addAction: addAction(deps)(internal),
    cancelAction: cancelAction(deps)(internal),
    findAction: findAction(deps)(internal),
    start: () =>
      start({
        ...deps,
        createTimerFn: createTimer,
        timeService,
        timerFn: timer,
      })(internal)(),
    stop: stop(deps)(internal),
  };
  return timeService;
};
