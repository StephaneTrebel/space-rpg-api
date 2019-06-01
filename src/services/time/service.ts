import { Subscription, timer } from 'rxjs';

import { Id } from '../../types/id';

import { ConfigService } from '../config/types';

import {
  Action,
  ActionList,
  ActionType,
  BaseAction,
  TimeConfig,
  TimeServiceFactory,
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

export interface GetActionParams {
  id: Id;
  type: ActionType;
}
type GetAction = (
  actionList: ActionList,
) => (params: GetActionParams) => Action;
export const getAction: GetAction = actionList => ({ id, type }) => {
  const maybeAction = actionList.find(action => action.id === id);
  if (!maybeAction) {
    throw new Error(`Cannot find action with id ${id}`);
  }
  if (!!maybeAction && maybeAction.type !== type) {
    throw new Error(
      `Action '${id}' found but its type ${
        maybeAction.type
      } is not the expected one ${type}`,
    );
  }
  return maybeAction;
};

export const timeServiceFactory: TimeServiceFactory = ({
  configService,
  loggerService,
  stateService,
}) => initialActionQueue => {
  const internal: { actionQueue: ActionList; timer?: Subscription } = {
    actionQueue: initialActionQueue || [],
  };
  const timeService: TimeService = {
    addAction: (action: Action) => {
      loggerService.debug(
        `Adding action to internal action queue: ${JSON.stringify(action)}`,
      );
      internal.actionQueue = addAction(internal.actionQueue)(action);
      return internal.actionQueue;
    },
    getAction: (params: GetActionParams) =>
      getAction(internal.actionQueue)(params),
    start: () =>
      (internal.timer = createTimer(getTimeConfig(configService))(() => {
        loggerService.debug('Tic-toc !');
        return Promise.all(
          internal.actionQueue.map(action =>
            action.executor({ loggerService, stateService, timeService }),
          ),
        ).then(() => (internal.actionQueue = []));
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
