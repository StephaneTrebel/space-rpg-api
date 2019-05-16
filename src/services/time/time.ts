import { Subscription, timer } from 'rxjs';
import { StateService } from '../state/state';

export type Action = (s: StateService) => Promise<any>;
export type ActionList = Array<Action>;

export interface TimeService {
  addAction: (b: Action) => void;
  start: () => Subscription;
  stop: () => void;
}
export const timeServiceFactory = (
  stateService: StateService,
  period: number = 3000,
  startDelay: number = 1000,
): TimeService => {
  const internal: { actionQueue: ActionList; timer?: Subscription } = {
    actionQueue: [],
  };
  return {
    addAction: (action: Action) =>
      (internal.actionQueue = [...internal.actionQueue, action]),
    start: () =>
      (internal.timer = timer(startDelay, period).subscribe(() => {
        console.log('TIC-TOC');
        return Promise.all(
          internal.actionQueue.map(action => action(stateService)),
        ).then(() => (internal.actionQueue = []));
      })),
    stop: () => internal.timer && internal.timer.unsubscribe(),
  };
};
