/**
 * Copyright Websublime All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { AnyAction, combineReducers, ConfigureStoreOptions, createReducer, Store } from '@reduxjs/toolkit';
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
   * Redux and store options.
   *
   * @private
   */
  private options: Partial<ConfigureStoreOptions>;

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

  private subscribers: Array<(state: RootState) => void> = [];

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
    this.options = setOptions(options);

    // TODO: add a remover
    this.redux.store.subscribe(() => {
      this.subscribers.forEach(subscriber => {
        const { store } = this.redux;

        subscriber(store.getState());
      })
    });
  }

  /**
   * Recreate cached reducers
   *
   * @private
   */
  private recreateCachedReducers(): void {
    const { store } = this.redux;
    const reducers = this.reducers.values();
    const cachedReducers = Array.from(reducers).reduce((acc, item) => acc = {...acc,...item}, {});
    const reducersList = Array.from(reducers).length
      ? combineReducers({ ...cachedReducers })
      : createReducer({}, builder => builder.addDefaultCase((state) => state));

    store.replaceReducer(reducersList);
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
    /*
    if(this.reducers.has(reducer.namespace)) {
      throw new Error(`Namespace: ${reducer.namespace.toString()} already exist. Is not allowed override existing namespaces.`);
    }
    */

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

  /**
   * Remove reducer from store and recreate it.
   *
   * @param namespace - Reducer namespace
   * @public
   */
  removeReducer(namespace: symbol|string): boolean {
    const sizeBefore = this.connections.size;
    this.connections.delete(namespace);
    this.reducers.delete(namespace);
    const sizeAfter = this.connections.size;

    this.recreateCachedReducers();

    return sizeBefore > sizeAfter;
  }

  /**
   * Add a callback function to global state changes
   * 
   * @param state - RootState
   * @public
   */
  addSubscribers(subscriber: (state: RootState) => void) {
    this.subscribers.push(subscriber);
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
