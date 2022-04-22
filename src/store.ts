import { configureStore, createReducer, Store, AnyAction, combineReducers, createListenerMiddleware, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { EssentialReducer } from './reducer';
import { Environment } from './types';

const rootReducer = createReducer<Record<string, any>>({}, (builder) => {
  builder.addDefaultCase((state) => {
    return state;
  });
});

export type RootState = ReturnType<typeof rootReducer>;
export type EssentialGenericReducer = EssentialReducer & { dispatch(action: AnyAction): void; getState(): unknown };

export class EssentialStore {
  private store: Store<RootState, AnyAction>;

  private reducers = new WeakMap<typeof this, Record<string, any>>();

  private listenerMiddleware: ListenerMiddlewareInstance;

  get state() {
    return this.store.getState();
  }

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

  private setupReducer(essentialInstance: EssentialGenericReducer) {
    essentialInstance.listen(this.listenerMiddleware);

    const { dispatch, getState } = this.store;

    Object.defineProperties(essentialInstance, {
      dispatch: {
        enumerable: true,
        writable: false,
        value: dispatch
      },
      getState: {
        enumerable: true,
        writable: false,
        value: getState
      },
    });
  }

  addReducer<Reducer extends EssentialGenericReducer>(essentialReducer: Reducer) {
    this.setupReducer(essentialReducer as unknown as EssentialGenericReducer);

    const cachedReducers = this.reducers.get(this) || {};
    const reducer = combineReducers({ ...cachedReducers, [essentialReducer.namespace.toString()]: essentialReducer.reducersMap});

    this.store.replaceReducer(reducer);

    this.reducers.set(this, {[essentialReducer.namespace.toString()]: essentialReducer.reducersMap});

    return essentialReducer.dispatchers as Reducer['dispatchers'];
  }

  pipe(...args: [() => any]) {}
}
