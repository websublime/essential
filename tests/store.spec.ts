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
      namespace = 'myreducer';

      get initial() {
        return { count: 0 };
      }

      get actions() {
        return [
          {action: createAction('INCREMENT'), reducer: this.increment.bind(this) },
          {action: createAction('DECREMENT'), reducer: this.decrement.bind(this) }
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
          {action: createAction('PRINT'), reducer: this.log.bind(this) }
        ];
      }

      constructor(namespace: symbol|string) {
        super(namespace);

        this.initListeners();
      }

      log(state, action) {
        state.message = action.payload.message

        return state;
      }

      initListeners() {
        this.addListener(({ state, action}) => {
          console.log('FooReducer', {state, action});
        });
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
