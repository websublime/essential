# Essential

<p align="center" style="background: #4ecca3; text-align: center; width: 100%; margin-bottom: 2rem;">
  <img src="./logo.svg" alt="logo">
</p>

<p align="center">
  <img style="display: inline; margin: 0 6px" alt="GitHub issues" src="https://img.shields.io/github/issues/websublime/essential?style=flat-square">
  <img style="display: inline; margin: 0 6px" alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/websublime/essential?style=flat-square">
  <img style="display: inline; margin: 0 6px" alt="GitHub" src="https://img.shields.io/github/license/websublime/essential?style=flat-square">
  <img style="display: inline; margin: 0 6px" alt="PRS" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square">
  <img style="display: inline; margin: 0 6px" alt="CI" src="https://github.com/websublime/essential/actions/workflows/main-build.yml/badge.svg?branch=main">
</p>

<p align="center">
  <img style="display: inline; margin: 0 6px" alt="OSS" src="https://forthebadge.com/images/badges/open-source.svg">
  <img style="display: inline; margin: 0 6px" alt="Typescript" src="https://forthebadge.com/images/badges/made-with-typescript.svg">
</p>

<p align="center">❄️ Essential Redux Store</p>

Essential is an opinited implementation of redux toolkit in the form of OOP. It is designed for the browser but can also work on nodeJs.
This implementation is a vanilla implementation to work on all frameworks or node.

# Table of contents

- [Usage](#usage)
- [Installation](#installation)

# Usage

[(Back to top)](#table-of-contents)

Store is a singleton instance where you can use is as:

```ts
import { useStore } from '@websublime/essential';

const store = useStore();
```

Create a class  that will be responsable for the partial state of your global state. This reducer class is extended from or base class.

```ts
import { EssentialReducer, createAction } from '@websublime/essential';

type MyReducerState = { count: number };
type MyReducerDispatchers = {increment(count: number): void, decrement(count: number): void};

const INCREMENT_ACTION = createAction<MyReducerState>('INCREMENT');
const DECREMENT_ACTION = createAction<MyReducerState>('DECREMENT');

class MyReducer extends EssentialReducer<MyReducerState, MyReducerDispatchers> {
  get initial(): MyReducerState {
    return { count: 0 };
  }

  get actions() {
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
```

You can then register/build this reducer class in the store

```ts
const dispatchers = store.buildReducer<MyReducerState, MyReducerDispatchers, typeof MyReducer>(MyReducer, 'myreducer');
```

After being created the dispatchers object is returned and you can just dispatch any action you have defined on dispatchers property.

```ts
dispatchers.increment(1);
```

To be documented (more examples on tests like async, listeners).

# Installation

[(Back to top)](#table-of-contents)

```
npm install @websublime/essential
```

# Contributing

[(Back to top)](#table-of-contents)

Your contributions are always welcome! Please have a look at the [contribution guidelines](CONTRIBUTING.md) first. :tada:

Create branch, work on it and before submit run:
  - git add .
  - git commit -m "feat: title" -m "Description"
  - yarn changeset
  - git add .
  - git commit --amend
  - git push origin feat/... -f

# License

[(Back to top)](#table-of-contents)


The MIT License (MIT) 2022 - [Websublime](https://github.com/websublime/). Please have a look at the [LICENSE.md](LICENSE.md) for more details.
