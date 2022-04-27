/**
 * Copyright Websublime All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { createReducer, ListenerMiddlewareInstance, isAnyOf, PayloadActionCreator, createAction, AnyAction, Store } from '@reduxjs/toolkit';
import type { ReducerWithInitialState } from '@reduxjs/toolkit/dist/createReducer';
import { uniqueID } from './helpers';
import { useRedux } from './redux';
import { EssentialReducerActions, EssentialReducerListener, EssentialReducerListenerParams } from './types';

// type State<ReducerState> = ReducerState & RootState;

export abstract class EssentialReducer<EssentialReducerState = any, EssentialDispatchers = any> {

  /**
   * Initial is the default or initial state that should be applied
   * when creating reducers or to use it to reste state to initial form
   *
   * @public
   */
  abstract readonly initial: EssentialReducerState;

  /**
   * Actions are defined in the signature format of EssentialReducerActions
   * and they will be use to create the cases to trigger reducers.
   *
   * @public
   */
  abstract readonly actions: Array<EssentialReducerActions>;

  /**
   * Dispatchers object to use in public visibility where Action will
   * be triggered.
   *
   * public
   */
  abstract readonly dispatchers: EssentialDispatchers;

  /**
   * Map of reducers
   */
  public reducersMap: ReducerWithInitialState<EssentialReducerState>;

  /**
   * Unique namespace to identify on state tree the
   * reducer state. Be aware that this should be unique string.
   *
   * @public
   */
  public namespace: symbol|string = Symbol(uniqueID());

  /**
   * List of functions that should be called on every action trigger
   *
   * @private
   */
  private listeners: Array<EssentialReducerListener> = [];

  /**
   * Hook function to customize construct lifecycle
   *
   * @public
   */
  bootstrap?(): void;

  /**
   * Hook function to customize before dispatch
   *
   * @public
   */
  beforeDispatch?(args: { store: Store, action: AnyAction }): void;


  /**
   * Redux toolkit reference
   *
   * @private
   */
  private get redux() {
    return useRedux();
  }

  constructor(key?: symbol|string) {
    if(key) {
      this.namespace = key;
    }

    const { middleware } = this.redux;

    this.reducersMap = this.initReducers();
    this.initMiddleware(middleware);

    if(this.bootstrap) {
      this.bootstrap();
    }
  }

  /**
   * Create reducers from actions definition list
   *
   * @private
   */
  private initReducers() {
    return createReducer(this.initial, (builder) => {
      this.actions.forEach(item => {
        const { defaults = false } = item;

        defaults ? builder.addDefaultCase(item.reducer) : builder.addCase(item.action, item.reducer);
      });
    });
  }

  /**
   * Register callbacks functions and listen to reducer changes.
   *
   * @param listenerMiddleware - Redux middleware reference
   *
   * @private
   */
  private initMiddleware(listenerMiddleware: ListenerMiddlewareInstance) {
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

  /**
   * Dispatch a action to redux
   *
   * @param action - Action to dispatch
   */
  public dispatch(action: AnyAction) {
    const { store } = this.redux;

    if(this.beforeDispatch) {
      this.beforeDispatch({ store, action });
    }

    return store.dispatch(action);
  }

  /**
   * Get global state
   *
   * @public
   */
  public getState() {
    const { store } = this.redux;

    return store.getState();
  }

  /**
   * Get reducer namespace state
   *
   * @public
   */
  public getReducerState(): EssentialReducerState {
    const { store } = this.redux;
    const state = store.getState();

    return state[this.namespace.toString()];
  }

  /**
   * Register a function to be called when reducer change
   *
   * @param callback - Function to call on reducer state change
   * @param priority - Priority on the stack
   */
  addListener(callback: (args: EssentialReducerListenerParams) => void, priority = 1) {
    this.listeners.push({callback, priority});
  }
}
