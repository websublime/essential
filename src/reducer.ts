import { createReducer, ListenerMiddlewareInstance, isAnyOf, PayloadActionCreator, createAction, AnyAction } from '@reduxjs/toolkit';
import type { ReducerWithInitialState } from '@reduxjs/toolkit/dist/createReducer';
import { uniqueID } from './helpers';
import { EssentialReducerActions, EssentialReducerListener, EssentialReducerListenerParams } from './types';

export abstract class EssentialReducer<EssentialReducerState extends unknown = any, EssentialDispatchers extends unknown = any> {

  abstract get initial(): EssentialReducerState;

  abstract get actions(): Array<EssentialReducerActions>;

  abstract get dispatchers(): EssentialDispatchers;

  public reducersMap: ReducerWithInitialState<EssentialReducerState>;

  public namespace: symbol|string = Symbol(uniqueID());

  private listeners: Array<EssentialReducerListener> = [];

  declare dispatch: (action: AnyAction) => void;

  declare getState: () => EssentialReducerState;

  constructor(key?: symbol|string) {
    if(key) {
      this.namespace = key;
    }

    this.reducersMap = this.initReducers();
  }

  private initReducers() {
    return createReducer(this.initial, (builder) => {
      this.actions.forEach(item => {
        const { defaults = false } = item;

        defaults ? builder.addDefaultCase(item.reducer) : builder.addCase(item.action, item.reducer);
      });
    });
  }

  initMiddleware(listenerMiddleware: ListenerMiddlewareInstance) {
    const actions = this.actions.reduce((acc, item) => acc.concat([item.action]), [] as PayloadActionCreator<any>[]);

    listenerMiddleware.startListening({
      matcher: isAnyOf(createAction('INIT_REDUCER'), ...actions),
      effect: async (action , api) => {
        const state = api.getState();

        const callbacks = this.listeners.sort((before, after) => after.priority - before.priority).reduce((acc, item) => acc.concat([item.callback]), [] as Array<(args: any) => void>);

        callbacks.forEach(fn => fn({state, action}));
      }
    });
  }

  addListener(callback: (args: EssentialReducerListenerParams) => void, priority = 1) {
    this.listeners.push({callback, priority});
  }
}
