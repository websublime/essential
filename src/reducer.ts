/**
 * Copyright Websublime All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { createReducer, ListenerMiddlewareInstance, isAnyOf, PayloadActionCreator, createAction, AnyAction } from '@reduxjs/toolkit';
import type { ReducerWithInitialState } from '@reduxjs/toolkit/dist/createReducer';
import { uniqueID } from './helpers';
import { useRedux, RootState } from './redux';
import { EssentialReducerActions, EssentialReducerListener, EssentialReducerListenerParams } from './types';

type State<ReducerState> = ReducerState & RootState;

export abstract class EssentialReducer<EssentialReducerState = any, EssentialDispatchers = any> {

  /**
   * Initial is the default or initial state that should be applied
   * when creating reducers or to use it to reste state to initial form
   *
   * @return {EssentialReducerState} - Initial reducer store state
   * @public
   */
  abstract get initial(): EssentialReducerState;

  /**
   * Actions are defined in the signature format of EssentialReducerActions
   * and they will be use to create the cases to trigger reducers.
   *
   * @return {Array<EssentialReducerActions>} - List of EssentialReducerActions defined
   * @public
   */
  abstract get actions(): Array<EssentialReducerActions>;

  /**
   * Dispatchers object to use in public visibility where Action will
   * be triggered.
   *
   * @return {EssentialDispatchers} [description]
   * public
   */
  abstract get dispatchers(): EssentialDispatchers;

  public reducersMap: ReducerWithInitialState<EssentialReducerState>;

  /**
   * Unique namespace to identify on state tree the
   * reducer state. Be aware that this should be unique string.
   *
   * @public
   */
  public namespace: symbol|string = Symbol(uniqueID());

  private listeners: Array<EssentialReducerListener> = [];

  bootstrap?: () => void;

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

  private initReducers() {
    return createReducer(this.initial, (builder) => {
      this.actions.forEach(item => {
        const { defaults = false } = item;

        defaults ? builder.addDefaultCase(item.reducer) : builder.addCase(item.action, item.reducer);
      });
    });
  }

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

  public dispatch(action: AnyAction) {
    const { store } = this.redux;

    return store.dispatch(action)
  }

  public getState() {
    const { store } = this.redux;

    return store.getState() as State<EssentialReducerState>;
  }

  public getReducerState(): EssentialReducerState {
    const { store } = this.redux;
    const state = store.getState() as State<EssentialReducerState>;

    return state[this.namespace.toString()];
  }

  addListener(callback: (args: EssentialReducerListenerParams) => void, priority = 1) {
    this.listeners.push({callback, priority});
  }
}
