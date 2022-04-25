import { AnyAction, createAction } from '@reduxjs/toolkit';
import { EssentialReducer, EssentialStore, useStore } from '../src';

describe('> Async action', () => {
  let store: EssentialStore = null;

  beforeEach(() => {
    store = useStore();
  });

  test('Should test async', async () => {
    const fetch = <ArgType>(arg: ArgType) => new Promise<ArgType>(res => setTimeout(() => res(arg), 200));

    type MyAsyncState = { interval: number };
    type MyAsyncDispatchers = { time: (arg: number) => Promise<AnyAction> };

    const INTERVAL_ACTION = createAction<MyAsyncState>('INTERVAL');

    class MyBar extends EssentialReducer<MyAsyncState, MyAsyncDispatchers> {
      get initial() {
        return { interval: 0 };
      }

      get actions() {
        return [
          {action: INTERVAL_ACTION, reducer: this.intervalReducer.bind(this) }
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
        const [first] = this.actions;

        const interval = await fetch(time) * 2;

        return this.dispatch(first.action({interval}));
      }
    }

    const dispatchers = store.buildReducer<MyAsyncState, MyAsyncDispatchers, typeof MyBar>(MyBar, 'mybar');

    const { payload, type } = await dispatchers.time(10);

    expect(payload.interval).toEqual(20);
    expect(type).toEqual('INTERVAL');
  });
});
