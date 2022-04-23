import { configureStore, createReducer, Store, AnyAction, combineReducers, createListenerMiddleware, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { EssentialReducer } from './reducer';
import { Environment } from './types';

const rootReducer = createReducer<Record<string, any>>({}, (builder) => {
  builder.addDefaultCase((state) => {
    return state;
  });
});

type Constructor<Proto = unknown> = new (...args: any[]) => Proto;

export type RootState = ReturnType<typeof rootReducer>;
export type EssentialGenericReducer<State = unknown, Dispatchers = unknown> = EssentialReducer<State, Dispatchers> & { dispatch(action: AnyAction): void; getState(): unknown };
export type EssentialConstructReducer<State, Dispatchers, Reducer = unknown> = EssentialGenericReducer<State, Dispatchers> & Constructor<Reducer>;

export class EssentialStore {
  private store: Store<RootState, AnyAction>;

  private connections = new Map<symbol|string, EssentialGenericReducer>();

  private reducers = new Map<symbol|string, Record<string, any>>();

  private listenerMiddleware: ListenerMiddlewareInstance;

  get state() {
    return Object.freeze(this.store.getState());
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

  private setupReducer(reducer: EssentialGenericReducer) {
    const cachedReducers = Array.from(this.reducers.values()).reduce((acc, item) => acc = {...acc,...item}, {});

    const reducerEntry = { [reducer.namespace.toString()]: reducer.reducersMap };
    const reducersList = combineReducers({ ...cachedReducers, ...reducerEntry});

    this.store.replaceReducer(reducersList);

    return reducerEntry;
  }

  private bootReducer<State, Dispatchers>(reducer: EssentialGenericReducer<State, Dispatchers>) {
    reducer.initMiddleware(this.listenerMiddleware);

    this.reducers.set(reducer.namespace, this.setupReducer(reducer as EssentialGenericReducer));
    this.connections.set(reducer.namespace, reducer as EssentialGenericReducer);

    return reducer.dispatchers;
  }

  addReducer<Reducer extends EssentialGenericReducer>(reducer: Reducer): Pick<Reducer, 'dispatchers'> {
    const { dispatch, getState } = this.store

    Object.assign(reducer, {dispatch, getState});

    return this.bootReducer(reducer) as Pick<Reducer, 'dispatchers'>;
  }

  buildReducer<State, Dispatchers, Reducer extends Constructor<EssentialGenericReducer<State, Dispatchers>>>(ReducerClass: Reducer, namespace: symbol|string) {

    const { dispatch, getState } = this.store

    Object.assign(ReducerClass.prototype, {dispatch, getState});

    const proto = new ReducerClass(namespace);

    return this.bootReducer<State, Dispatchers>(proto as EssentialGenericReducer<State, Dispatchers>);
  }

  getReducer<Reducer = EssentialGenericReducer>(namespace: symbol|string): Reducer {
    return this.connections.get(namespace) as unknown as Reducer;
  }

  pipe(...args: [() => any]) {}
}
