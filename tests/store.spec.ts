import { createAction } from '@reduxjs/toolkit';
import { EssentialReducer, EssentialStore, useStore } from '../src';
import { uniqueID } from '../src/helpers';

describe('> Store', () => {
  let store: EssentialStore = null;

  test('Init', () => {
    store = useStore()

    expect(store).toBeTruthy();
  });

  test('Reducer', () => {

    type MyReducerState = {count: number};
    type MyReducerDispatchers = {increment(count: number): void, decrement(count: number): void};

    class MyReducer extends EssentialReducer<MyReducerState, MyReducerDispatchers> {
      namespace = 'myreducer';

      get initial() {
        return { count: 0 };
      }

      get actions() {
        return [
          {action: createAction<{count: number}>('INCREMENT'), reducer: this.incrementReducer.bind(this) },
          {action: createAction<{count: number}>('DECREMENT'), reducer: this.decrementReducer.bind(this) }
        ];
      }

      get dispatchers(): MyReducerDispatchers {
        return {
          increment: this.incrementDispatcher.bind(this),
          decrement: this.decrementDispatcher.bind(this)
        };
      }

      private incrementReducer(state, action) {
        state.count = state.count + action.payload.count

        return state;
      }

      private decrementReducer(state, action) {
        state.count = state.count - action.payload.count

        return state;
      }

      private incrementDispatcher(count = 1) {
        const [first] = this.actions;

        this.dispatch(first.action({ count }));
      }

      private decrementDispatcher(count = 0) {
        const [first, last] = this.actions;

        this.dispatch(last.action({ count }));
      }
    }

    const myReducer = new MyReducer(Symbol(uniqueID()));

    const dispatchers = store.addReducer(myReducer);

    dispatchers.increment(1);
    console.log(myReducer.getState(), myReducer.initial);
    dispatchers.increment(1);
    console.log(myReducer.getState(), myReducer.initial);
    dispatchers.increment(1);
    console.log(myReducer.getState(), myReducer.initial);
    dispatchers.decrement(3);
    console.log(myReducer.getState(), myReducer.initial);
  });
});
