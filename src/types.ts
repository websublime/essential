/**
 * Copyright Websublime All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { AnyAction, PayloadActionCreator } from '@reduxjs/toolkit';
import type { ReducerWithInitialState } from '@reduxjs/toolkit/dist/createReducer';

export type Constructor<Proto = unknown> = new (...args: any[]) => Proto;

export type Environment = 'local'|'production'|'development'|'staging'|'test';

export interface EssentialReducerListenerParams<State = unknown, Action = AnyAction> {
  state: State;
  action: Action;
};

export interface EssentialReducerListener {
  callback: (args: EssentialReducerListenerParams) => void;
  priority: number
};

export interface EssentialReducerActions<Payload = any> {
  reducer: ReducerWithInitialState<any>;
  action: PayloadActionCreator<Payload>;
  defaults?: boolean;
}

/* Reworking typings */

/*
type Actions = { action: AnyAction; reducer: <State, Action>(state: State ,arg: Action) => any }

interface Abstract<State, Dispatchers> {
  readonly initial: State;

  readonly dispatchers: Dispatchers;

  readonly actions: Array<Actions>;

  dispatch(action: AnyAction): any;
}

abstract class Parent<State, Dispatchers> implements Abstract<State, Dispatchers> {
  abstract readonly initial: State;

  abstract readonly dispatchers: Dispatchers;

  abstract readonly actions: Array<Actions>;

  public dispatch(action: AnyAction): AnyAction {
    return action;
  }

  public getReducerState(): State {
    return {} as State;
  }
}

type MyState = {count: number};
type MyDispatchers = { log: () => Promise<AnyAction>};

const INTERVAL_ACTION = createAction<MyState>('INTERVAL');

class My extends Parent<MyState, MyDispatchers> {
  get initial() {
      return { count: 0 };
  }

  get dispatchers() {
    return {
      log: this.logDispatcher.bind(this)
    }
  }

  get actions() {
    return [
      { action: INTERVAL_ACTION, reducer: this.logReducer.bind(this) }
    ];
  }

  private logReducer(state: MyState, action: ReturnType<typeof INTERVAL_ACTION>) {
    return state;
  }

  private async logDispatcher() {
    return this.dispatch({ type: 'action' });
  }
}
*/
