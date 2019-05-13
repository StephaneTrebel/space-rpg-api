import { State } from '../state/state';

export type Action = (s: State) => Promise<void>;
export type ActionList = Array<Action>;

type AddActionInQueue = (b: Action) => void;
const addAction: (a: ActionList) => AddActionInQueue = actionQueue => action =>
  (actionQueue = [...actionQueue, action]);

export interface TimeService {
  addAction: AddActionInQueue;
}
export const timeServiceFactory = (): TimeService => {
  const actionQueue: ActionList = [];
  return {
    addAction: addAction(actionQueue),
  };
};
