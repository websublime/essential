import './style.css'
import { useStore, createAction, EssentialReducer } from '@websublime/essential';

const store = useStore({ devTools: true });

type MyReducerState = {count: number};
type MyReducerDispatchers = {increment(count: number): void, decrement(count: number): void};

const INCREMENT_ACTION = createAction<MyReducerState>('INCREMENT');
const DECREMENT_ACTION = createAction<MyReducerState>('DECREMENT');

class MyReducer extends EssentialReducer<MyReducerState, MyReducerDispatchers> {
  get initial(): MyReducerState {
    return { count: 0 };
  }

  get actions(): any {
    return [
      {action: INCREMENT_ACTION, reducer: this.incrementReducer.bind(this) },
      {action: DECREMENT_ACTION, reducer: this.decrementReducer.bind(this) }
    ];
  }

  get dispatchers(): MyReducerDispatchers {
    return {
      increment: this.incrementDispatcher.bind(this),
      decrement: this.decrementDispatcher.bind(this)
    };
  }

  private incrementReducer(state: MyReducerState, action: ReturnType<typeof INCREMENT_ACTION>) {
    state.count = state.count + action.payload.count

    return state;
  }

  private decrementReducer(state: MyReducerState, action: ReturnType<typeof DECREMENT_ACTION>) {
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

const app = document.querySelector<HTMLDivElement>('#app')!;

const p = document.createElement('p');
const label = document.createElement('label');
label.textContent = '0';

p.appendChild(label);

const increment = document.createElement('button');
increment.textContent = 'Increment';
increment.addEventListener('click', (event) => {
  event.preventDefault();

  dispatchers.increment(1);
  label.textContent = store.state.myreducer.count;
});

const decrement = document.createElement('button');
decrement.textContent = 'Decrement';
decrement.addEventListener('click', (event) => {
  event.preventDefault();

  dispatchers.decrement(1);
  label.textContent = store.state.myreducer.count;
});

app.appendChild(increment);
app.appendChild(p);
app.appendChild(decrement);