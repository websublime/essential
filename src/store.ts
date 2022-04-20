import { configureStore, createReducer, Store, AnyAction, combineReducers, createAction } from "@reduxjs/toolkit";
import { EssentialReducer } from "./reducer";
import { Environment } from "./types";

const rootReducer = createReducer<any>({}, (builder) => {
  builder.addDefaultCase((state) => {
    return state;
  });
});

export type RootState = ReturnType<typeof rootReducer>;

export class EssentialStore {
  private store: Store<RootState, AnyAction>;

  private slices = new WeakMap<typeof this, Record<string, any>>();

  constructor(env: Environment = 'local') {
    this.store = configureStore({
      devTools: env === 'local',
      reducer: rootReducer
    });

    this.store.subscribe(() => {
      console.log(this.store.getState());
    });
  }

  addReducer(reducers: EssentialReducer) {
    const cachedReducers = this.slices.get(this) || {};
    const reducer = combineReducers({ ...cachedReducers, [reducers.namespace.toString()]: reducers.reducersMap});

    this.store.replaceReducer(reducer);

    this.slices.set(this, {[reducers.namespace.toString()]: reducers.reducersMap});
  }

  dispatch(action: AnyAction) {
    this.store.dispatch(action);
  }

  pipe(...args: [() => any]) {}
}
