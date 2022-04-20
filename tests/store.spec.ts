import { createAction } from '@reduxjs/toolkit';
import { EssentialReducer, EssentialStore, useStore } from '../src';
import { uniqueID } from "../src/helpers";

describe('> Store', () => {
  let store: EssentialStore = null;

  test('Init', () => {
    store = useStore()

    expect(store).toBeTruthy();
  });

  test('Reducer', () => {
    //debugger;

    class MyReducer extends EssentialReducer {
      get initial() {
        return { count: 0 };
      }

      get actions() {
        return [
          {type: createAction('INCREMENT'), action: this.increment.bind(this) },
          {type: createAction('DECREMENT'), action: this.decrement.bind(this) }
        ];
      }

      increment(state, action) {
        state.count = state.count + action.payload.count

        return state;
      }

      decrement(state, action) {
        state.count = state.count - action.payload.count

        return state;
      }
    }

    class FooReducer extends EssentialReducer {
      get initial() {
        return { message: null };
      }

      get actions() {
        return [
          {type: createAction('PRINT'), action: this.log.bind(this) }
        ];
      }

      log(state, action) {
        state.message = action.payload.message

        return state;
      }
    }

    const myReducer = new MyReducer(Symbol(uniqueID()));
    const fooReducer = new FooReducer(Symbol(uniqueID()));

    store.addReducer(myReducer);
    store.addReducer(fooReducer);

    const action = createAction<{count: number}>('INCREMENT');
    const actionB = createAction<{count: number}>('DECREMENT');
    const actionC = createAction<{message: string}>('PRINT');

    store.dispatch(action({ count: 1}));
    store.dispatch(action({ count: 1}));
    store.dispatch(actionB({ count: 2}));
    store.dispatch(actionC({ message: 'Hello World'}));

  });
});
