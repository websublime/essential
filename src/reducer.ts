import { createReducer, ListenerMiddlewareInstance, isAnyOf, PayloadActionCreator, createAction, AnyAction} from "@reduxjs/toolkit";
import { ReducerWithInitialState } from "@reduxjs/toolkit/dist/createReducer";
import { uniqueID } from "./helpers";

export abstract class EssentialReducer {
  abstract get initial(): any;

  abstract get actions(): {reducer: any, action: PayloadActionCreator , defaults?: boolean}[];

  public reducersMap: ReducerWithInitialState<any>;

  public namespace: symbol|string = Symbol(uniqueID());

  private listeners: Array<{callback: (args: any) => void, priority: number}> = [];

  constructor(key?: symbol|string) {
    this.reducersMap = this.initReducers();

    if(key) {
      this.namespace = key;
    }
  }

  private initReducers() {
    return createReducer(this.initial, (builder) => {
      this.actions.forEach(item => {
        const { defaults = false } = item;

        defaults ? builder.addDefaultCase(item.reducer) : builder.addCase(item.action, item.reducer);
      });
    });
  }

  listen(listenerMiddleware: ListenerMiddlewareInstance) {
    const actions = this.actions.reduce((acc, item) => acc.concat([item.action]), [] as PayloadActionCreator[]);

    listenerMiddleware.startListening({
      matcher: isAnyOf(createAction('INIT_REDUCER'), ...actions),
      effect: async (action , api) => {
        const state = api.getState();

        const callbacks = this.listeners.sort((before, after) => after.priority - before.priority).reduce((acc, item) => acc.concat([item.callback]), [] as Array<(args: any) => void>);

        callbacks.forEach(fn => fn({state, action}));
      }
    });
  }

  addListener(callback: (args: {state: unknown, action: AnyAction}) => void, priority = 1): void {
    this.listeners.push({callback, priority});
  }
}
