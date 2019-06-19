import { Subscription, timer } from 'rxjs';

import { Id } from '../../utils/id/types';

import { ConfigService } from '../config/types';
import { LoggerService } from '../logger/types';
import { StateService } from '../state/types';

import {
  Action,
  ActionList,
  ActionType,
  BaseAction,
  TimeConfig,
  TimeService,
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

export interface FindActionParams {
  id: Id;
}
type FindAction = (
  actionList: ActionList,
) => (params: FindActionParams) => Action;
export const findAction: FindAction = actionList => ({ id }) => {
  const maybeAction = actionList.find(action => action.id === id);
  if (!maybeAction) {
    throw new Error(`Cannot find action with id '${id}'`);
  }
  return maybeAction;
};

export type TimeServiceFactory = (deps: {
  configService: ConfigService;
  loggerService: LoggerService;
  stateService: StateService;
}) => (initialActionQueue?: ActionList | undefined) => TimeService;
export const timeServiceFactory: TimeServiceFactory = ({
  configService,
  loggerService,
  stateService,
}) => initialActionQueue => {
  const internal: {
    actionQueue: ActionList;
    processQueue: ActionList;
    timer?: Subscription;
  } = {
    actionQueue: initialActionQueue || [],
    processQueue: [],
  };
  const timeService: TimeService = {
    addAction: (action: Action) => {
      loggerService.debug(
        `Adding action to internal action queue: ${JSON.stringify(action)}`,
      );
      internal.actionQueue = addAction(internal.actionQueue)(action);
      return internal.actionQueue;
    },
    findAction: (params: FindActionParams) =>
      findAction(internal.actionQueue)(params),
    start: () =>
      (internal.timer = createTimer(getTimeConfig(configService))(() => {
        internal.processQueue = [...internal.actionQueue];
        internal.actionQueue = [];
        return Promise.all(
          internal.processQueue.map(action =>
            action.executor({ loggerService, stateService, timeService }),
          ),
        );
      })),
    stop: () => internal.timer && internal.timer.unsubscribe(),
  };
  return timeService;
};

export const MOCK_BASE_ACTION: BaseAction = {
  executor: () => Promise.resolve(),
  id: 'mock base action',
  type: ActionType.MOCK,
};
export const createBaseActionMock = ({
  executor,
  id,
}: BaseAction = MOCK_BASE_ACTION): BaseAction => ({
  executor,
  id,
  type: ActionType.MOCK,
});
