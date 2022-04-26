import { AnyAction, createAction } from '@reduxjs/toolkit';
import { EssentialReducer, EssentialStore, useStore } from '../src';

describe('> Async action', () => {
  let store: EssentialStore = null;
  const fetch = <ArgType>(arg: ArgType) => new Promise<ArgType>(res => setTimeout(() => res(arg), 200));

  beforeEach(() => {
    store = useStore();
  });

  test('Should test async', async () => {
    type MyAsyncState = { interval: number };
    type MyAsyncDispatchers = { time: (arg: number) => Promise<AnyAction> };

    const INTERVAL_ACTION = createAction<MyAsyncState>('INTERVAL');

    class MyBar extends EssentialReducer<MyAsyncState, MyAsyncDispatchers> {
      get initial() {
        return { interval: 0 };
      }

      get actions() {
        return [
          { action: INTERVAL_ACTION, reducer: this.intervalReducer.bind(this) }
        ];
      }

      get dispatchers(): MyAsyncDispatchers {
        return {
          time: this.printDispatcher.bind(this)
        };
      }

      private intervalReducer(state: MyAsyncState, action: ReturnType<typeof INTERVAL_ACTION>) {
        state.interval = action.payload.interval;

        return state;
      }

      private async printDispatcher(time = 0) {
        const [intervalAction] = this.actions;

        const interval = await fetch(time) * 2;

        return this.dispatch(intervalAction.action({interval}));
      }
    }

    const dispatchers = store.buildReducer<MyAsyncState, MyAsyncDispatchers, typeof MyBar>(MyBar, 'mybar');

    const { payload, type } = await dispatchers.time(10);

    expect(payload.interval).toEqual(20);
    expect(type).toEqual('INTERVAL');
  });

  test('Should test multiple async', async () => {
    type MyAsyncState = { interval: number, second: number };
    type MyAsyncDispatchers = { time: (arg: number) => Promise<AnyAction>, newTime: (arg: number) => Promise<MyAsyncState>, reset: () => void; };

    const INTERVAL_ACTION = createAction<MyAsyncState>('INTERVAL');
    const SECOND_ACTION = createAction<MyAsyncState>('SECOND');
    const RESET_ACTION = createAction<MyAsyncState>('RESET');

    class MyAsync extends EssentialReducer<MyAsyncState, MyAsyncDispatchers> {
      get initial() {
        return { interval: 0, second: 0 };
      }

      get actions() {
        return [
          { action: INTERVAL_ACTION, reducer: this.intervalReducer.bind(this) },
          { action: SECOND_ACTION, reducer: this.secondReducer.bind(this) },
          { action: RESET_ACTION, reducer: this.resetReducer.bind(this) }
        ];
      }

      get dispatchers(): MyAsyncDispatchers {
        return {
          time: this.printDispatcher.bind(this),
          newTime: this.newPrintDispatcher.bind(this),
          reset: this.resetDispatcher.bind(this),
        };
      }

      private resetReducer(state: MyAsyncState, action: ReturnType<typeof RESET_ACTION>) {
        state = { ...this.initial };

        return state;
      }

      private intervalReducer(state: MyAsyncState, action: ReturnType<typeof INTERVAL_ACTION>) {
        state.interval = action.payload.interval;

        return state;
      }

      private secondReducer(state: MyAsyncState, action: ReturnType<typeof SECOND_ACTION>) {
        state.second = action.payload.second;

        return state;
      }

      private resetDispatcher() {
        const [_f, _s, resetAction] = this.actions;
        return this.dispatch(resetAction.action());
      }

      private async printDispatcher(time = 0) {
        const [intervalAction] = this.actions;
        const { second } = this.getReducerState();

        const interval = await fetch(time) * 2;

        return this.dispatch(intervalAction.action({ interval, second }));
      }

      private async newPrintDispatcher(time = 0) {
        const [_intervalAction, secondAction] = this.actions;
        const { interval } = this.getReducerState();

        const second = await fetch(time) * 4;

        this.dispatch(secondAction.action({interval, second}));

        await this.printDispatcher(time);

        return this.getReducerState();
      }
    }

    const dispatchers = store.buildReducer<MyAsyncState, MyAsyncDispatchers, typeof MyAsync>(MyAsync, 'myasync');

    dispatchers.reset();

    const { interval, second } = await dispatchers.newTime(10);

    expect(second).toEqual(40);
    expect(interval).toEqual(20);
  });
});
