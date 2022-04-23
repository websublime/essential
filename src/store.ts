/**
 * Copyright Websublime All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { AnyAction, combineReducers } from '@reduxjs/toolkit';
import { EssentialReducer } from './reducer';
import { useRedux, RootState } from './redux';

type Constructor<Proto = unknown> = new (...args: any[]) => Proto;

export type EssentialGenericReducer<State = unknown, Dispatchers = unknown> = EssentialReducer<State, Dispatchers> & { dispatch(action: AnyAction): void; getState(): unknown };
export type EssentialConstructReducer<State, Dispatchers, Reducer = unknown> = EssentialGenericReducer<State, Dispatchers> & Constructor<Reducer>;

export class EssentialStore {
  private connections = new Map<symbol|string, EssentialGenericReducer>();

  private reducers = new Map<symbol|string, Record<string, any>>();

  get state(): RootState {
    const { store } = this.redux;

    return store.getState();
  }

  private get redux() {
    return useRedux();
  }

  private setupReducer(reducer: EssentialGenericReducer) {
    const { store } = this.redux;
    const cachedReducers = Array.from(this.reducers.values()).reduce((acc, item) => acc = {...acc,...item}, {});

    const reducerEntry = { [reducer.namespace.toString()]: reducer.reducersMap };
    const reducersList = combineReducers({ ...cachedReducers, ...reducerEntry});

    store.replaceReducer(reducersList);

    return reducerEntry;
  }

  private bootReducer<State, Dispatchers>(reducer: EssentialGenericReducer<State, Dispatchers>) {
    this.reducers.set(reducer.namespace, this.setupReducer(reducer as EssentialGenericReducer));
    this.connections.set(reducer.namespace, reducer as EssentialGenericReducer);

    return reducer.dispatchers;
  }

  addReducer<Reducer extends EssentialGenericReducer>(reducer: Reducer): Pick<Reducer, 'dispatchers'> {
    return this.bootReducer(reducer) as Pick<Reducer, 'dispatchers'>;
  }

  buildReducer<State, Dispatchers, Reducer extends Constructor<EssentialGenericReducer<State, Dispatchers>>>(ReducerClass: Reducer, namespace: symbol|string) {
    const proto = new ReducerClass(namespace);

    return this.bootReducer<State, Dispatchers>(proto as EssentialGenericReducer<State, Dispatchers>);
  }

  getReducer<Reducer = EssentialGenericReducer>(namespace: symbol|string): Reducer {
    return this.connections.get(namespace) as unknown as Reducer;
  }

  pipe(...args: [() => any]) {}
}
