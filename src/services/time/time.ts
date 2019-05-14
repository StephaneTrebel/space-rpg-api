import { StateService } from '../state/state';

export type Action = (s: StateService) => Promise<any>;
export type ActionList = Array<Action>;

type ExecuteActionList = () => Promise<any>;

export interface TimeService {
  addAction: (b: Action) => void;
  executeActionList: ExecuteActionList;
}
export const timeServiceFactory = (stateService: StateService): TimeService => {
  const internal: { actionQueue: ActionList } = {
    actionQueue: [],
  };
  return {
    addAction: (action: Action) =>
      (internal.actionQueue = [...internal.actionQueue, action]),
    executeActionList: () =>
      Promise.all(internal.actionQueue.map(action => action(stateService))),
  };
};
