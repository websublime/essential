import { configureStore, createReducer, Store, AnyAction } from "@reduxjs/toolkit";
import { Environment } from "./types";

const rootReducer = createReducer({}, (builder) => {
  builder.addDefaultCase((state) => {
    return state;
  });
});

export type RootState = ReturnType<typeof rootReducer>;

export class EssentialStore {
  private store: Store<RootState, AnyAction>;

  constructor(env: Environment = 'local') {
    this.store = configureStore({
      devTools: env === 'production',
      reducer: rootReducer
    });

    this.store.subscribe(() => {
      console.log(this.store.getState());
    });
  }

  add() {}
}