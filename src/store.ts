import { configureStore, createReducer, Store, AnyAction, combineReducers, createListenerMiddleware, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
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

  private reducers = new WeakMap<typeof this, Record<string, any>>();

  private listenerMiddleware: ListenerMiddlewareInstance;

  constructor(env: Environment = 'local') {
    this.listenerMiddleware = createListenerMiddleware();

    this.store = configureStore({
      devTools: env === 'local',
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
      }).prepend(this.listenerMiddleware.middleware)
    });
  }

  addReducer(reducers: EssentialReducer) {
    reducers.listen(this.listenerMiddleware);

    const cachedReducers = this.reducers.get(this) || {};
    const reducer = combineReducers({ ...cachedReducers, [reducers.namespace.toString()]: reducers.reducersMap});

    this.store.replaceReducer(reducer);

    this.reducers.set(this, {[reducers.namespace.toString()]: reducers.reducersMap});
  }

  dispatch(action: AnyAction) {
    this.store.dispatch(action);
  }

  pipe(...args: [() => any]) {}
}
