import type { AnyAction, PayloadActionCreator, Store } from '@reduxjs/toolkit';
import type { ReducerWithInitialState } from '@reduxjs/toolkit/dist/createReducer';

export type Environment = 'local'|'production'|'development'|'staging'|'test';

export interface EssentialReducerListenerParams {
  state: unknown;
  action: AnyAction;
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

export interface EssentialReducerImplementation {
  dispatch(action: AnyAction): any;
  getState(): Store;
}
