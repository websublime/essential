/**
 * Copyright Websublime All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import type { AnyAction, PayloadActionCreator, Store } from '@reduxjs/toolkit';
import type { ReducerWithInitialState } from '@reduxjs/toolkit/dist/createReducer';
import { EssentialReducer } from './reducer';

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

type EssentialAbsctractReducer<ReducerState, ReducerDispatchers> = EssentialReducer<ReducerState, ReducerDispatchers>;

// interface EssentialReducerImplementation extends EssentialReducer

