import { createAction } from '@reduxjs/toolkit';
import { EssentialReducer, EssentialStore, useStore } from '../src';

describe('> Store', () => {
  let store: EssentialStore = null;

  beforeEach(() => {
    store = useStore();
  });

  test('Should initialize store', () => {
    expect(store).toBeTruthy();
  });

  test('Should create a single reducer', () => {

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
        const [_, last] = this.actions;

        this.dispatch(last.action({ count }));
      }
    }

    const dispatchers = store.buildReducer<MyReducerState, MyReducerDispatchers, typeof MyReducer>(MyReducer, 'myreducer');

    dispatchers.increment(1);
    expect(store.state.myreducer.count).toEqual(1);

    dispatchers.increment(1);
    expect(store.state.myreducer.count).toEqual(2);

    dispatchers.increment(1);
    expect(store.state.myreducer.count).toEqual(3);

    dispatchers.decrement(3);
    expect(store.state.myreducer.count).toEqual(0);
  });

  test('Should create multiple reducers', () => {
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

    dispatcherFoo.print('Hello World');
    dispatcherBar.log('Message from space');

    expect(store.state.myfoo.message).toEqual('Hello World');
    expect(store.state.mybar.log).toEqual('Message from space');
  });

  test('Should test listener', (done) => {
    // { type: 'PRINT', payload: { message: 'Hello World' } }
    type MyBarState = {log: string};
    type MyBarDispatchers = {log(msg: string): void};

    const LOG_ACTION = createAction<{log: string}>('LOG');

    class MyBar extends EssentialReducer<MyBarState, MyBarDispatchers> {
      get initial() {
        return { log: null };
      }

      get actions() {
        return [
          {action: LOG_ACTION, reducer: this.printReducer.bind(this) }
        ];
      }

      get dispatchers(): MyBarDispatchers {
        return {
          log: this.printDispatcher.bind(this)
        };
      }

      private printReducer(state: MyBarState, action: ReturnType<typeof LOG_ACTION>) {
        state.log = action.payload.log

        return state;
      }

      private printDispatcher(log = '') {
        const [first] = this.actions;

        this.dispatch(first.action({ log }));
      }
    }

    const dispatcherBar = store.buildReducer<MyBarState, MyBarDispatchers, typeof MyBar>(MyBar, 'mybar');

    const barReducer = store.getReducer<MyBar>('mybar');

    barReducer.addListener(({ state, action }: {state: {mybar: MyBarState}, action: ReturnType<typeof LOG_ACTION> }) => {
      expect(action.type).toEqual('LOG');
      expect(action.payload).toEqual({ log: 'Message from space' });
      expect(state.mybar.log).toEqual('Message from space');
      done();
    });

    expect(barReducer.initial.log).toEqual(null);
    expect(barReducer.getReducerState()).toEqual({ log: 'Message from space' });

    dispatcherBar.log('Message from space');
  });
});
