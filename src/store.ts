/**
 * Copyright Websublime All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { AnyAction, combineReducers, ConfigureStoreOptions, Store } from '@reduxjs/toolkit';
import { EssentialReducer } from './reducer';
import { useRedux, setOptions } from './redux';
import { Constructor } from './types';

export interface EssentialGeneric {
  dispatch(action: AnyAction): void;
  getState(): unknown;
}

export type EssentialGenericReducer<State = unknown, Dispatchers = unknown> = EssentialReducer<State, Dispatchers> & EssentialGeneric;
export type EssentialConstructReducer<State, Dispatchers, Reducer = unknown> = EssentialGenericReducer<State, Dispatchers> & Constructor<Reducer>;

export class EssentialStore<RootState = any> {
  /**
   * Reducers instances
   *
   * @private
   */
  private connections = new Map<symbol|string, EssentialGenericReducer>();

  /**
   * Reducers actions definition
   *
   * @private
   */
  private reducers = new Map<symbol|string, Record<string, any>>();

  /**
   * Global state
   *
   * @public
   */
  get state() {
    const { store }: { store: Store<RootState, AnyAction> } = this.redux;

    return store.getState();
  }

  /**
   * Redux api
   *
   * @private
   */
  private get redux() {
    return useRedux();
  }

  constructor(options: Partial<ConfigureStoreOptions>) {
    setOptions(options);
  }

  /**
   * Recreate store reducers
   *
   * @param reducer - Reducer map
   */
  private setupReducer(reducer: EssentialGenericReducer) {
    const { store } = this.redux;
    const cachedReducers = Array.from(this.reducers.values()).reduce((acc, item) => acc = {...acc,...item}, {});

    const reducerEntry = { [reducer.namespace.toString()]: reducer.reducersMap };
    const reducersList = combineReducers({ ...cachedReducers, ...reducerEntry});

    store.replaceReducer(reducersList);

    return reducerEntry;
  }

  /**
   * Caches reducers actions and instances
   *
   * @private
   */
  private bootReducer<State, Dispatchers>(reducer: EssentialGenericReducer<State, Dispatchers>) {
    this.reducers.set(reducer.namespace, this.setupReducer(reducer as EssentialGenericReducer));
    this.connections.set(reducer.namespace, reducer as EssentialGenericReducer);

    return reducer.dispatchers;
  }

  /**
   * Adds a reducer instance
   *
   * @public
   */
  addReducer<Reducer extends EssentialGenericReducer>(reducer: Reducer): Pick<Reducer, 'dispatchers'> {
    return this.bootReducer(reducer) as Pick<Reducer, 'dispatchers'>;
  }

  /**
   * Create an instance from reducer class
   *
   * @public
   */
  buildReducer<State, Dispatchers, Reducer extends Constructor<EssentialGenericReducer<State, Dispatchers>>>(ReducerClass: Reducer, namespace: symbol|string) {
    const proto = new ReducerClass(namespace);

    return this.bootReducer<State, Dispatchers>(proto as EssentialGenericReducer<State, Dispatchers>);
  }

  /**
   * Grab a reducer instance
   *
   * @public
   */
  getReducer<Reducer = EssentialGenericReducer>(namespace: symbol|string): Reducer {
    return this.connections.get(namespace) as unknown as Reducer;
  }

  /*
  pipe(inputSelectors: [], resultFunc: () => any)
  pipe(args: [(state: any) => any]) {
    const initState = (state: RootState) => state;
    const selector = createSelector(initState, ...args)
    return selector(this.state);
  }
  */
}
