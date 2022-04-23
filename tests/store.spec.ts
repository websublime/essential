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
      get initial(): MyReducerState {
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

    const dispatchers = store.buildReducer<MyReducerState, MyReducerDispatchers, typeof MyReducer>(MyReducer, 'myreducer');

    dispatchers.increment(1);
    console.log(store.state);
    dispatchers.increment(1);
    console.log(store.state);
    dispatchers.increment(1);
    console.log(store.state);
    dispatchers.decrement(3);
    console.log(store.state);
  });

  test('Reducer Connection', () => {
    type MyFooState = {message: string};
    type MyFooDispatchers = {print(msg: string): void};

    class MyFoo extends EssentialReducer<MyFooState, MyFooDispatchers> {
      get initial() {
        return { message: null };
      }

      get actions() {
        return [
          {action: createAction<{message: string}>('PRINT'), reducer: this.printReducer.bind(this) }
        ];
      }

      get dispatchers(): MyFooDispatchers {
        return {
          print: this.printDispatcher.bind(this)
        };
      }

      private printReducer(state, action) {
        state.message = action.payload.message

        return state;
      }

      private printDispatcher(message = '') {
        const [first] = this.actions;

        this.dispatch(first.action({ message }));
      }
    }

    type MyBarState = {log: string};
    type MyBarDispatchers = {log(msg: string): void};

    class MyBar extends EssentialReducer<MyBarState, MyBarDispatchers> {
      get initial() {
        return { log: null };
      }

      get actions() {
        return [
          {action: createAction<{log: string}>('LOG'), reducer: this.printReducer.bind(this) }
        ];
      }

      get dispatchers(): MyBarDispatchers {
        return {
          log: this.printDispatcher.bind(this)
        };
      }

      private printReducer(state, action) {
        state.log = action.payload.log

        return state;
      }

      private printDispatcher(log = '') {
        const [first] = this.actions;

        this.dispatch(first.action({ log }));
      }
    }

    const dispatcherFoo = store.buildReducer<MyFooState, MyFooDispatchers, typeof MyFoo>(MyFoo, 'myfoo');
    const dispatcherBar = store.buildReducer<MyBarState, MyBarDispatchers, typeof MyBar>(MyBar, 'mybar');

    const fooReducer = store.getReducer<MyFoo>('myfoo');

    fooReducer.addListener(({ state, action}) => console.log(state, action));

    dispatcherFoo.print('Hello World');
    dispatcherBar.log('Message from space');

    console.log(store.state);
  });
});
