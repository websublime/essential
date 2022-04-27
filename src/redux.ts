/**
 * Copyright Websublime All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { configureStore, ConfigureStoreOptions, createListenerMiddleware, createReducer, Store } from '@reduxjs/toolkit';

type StoreProvider = {
  options: Partial<ConfigureStoreOptions>,
  redux: Store | null;
  listenerMiddleware: ReturnType<typeof createListenerMiddleware>;
};

export const { setOptions, useRedux } = (() => {
  const scope = {
    options: {},
    redux: null,
    listenerMiddleware: createListenerMiddleware()
  } as StoreProvider;

  const rootReducer = createReducer({}, (builder) => {
    builder.addDefaultCase((state) => {
      return state;
    });
  });

  const provider = {
    setOptions(options: Partial<ConfigureStoreOptions>) {
      return scope.options = { ...scope.options, ...options };
    },
    useRedux() {
      if(!scope.redux) {
        scope.redux = configureStore({
          reducer: rootReducer,
          middleware: (getDefaultMiddleware) => getDefaultMiddleware({
            serializableCheck: false
          }).prepend(scope.listenerMiddleware.middleware),
          ...scope.options
        })
      }

      return {
        store: scope.redux,
        middleware: scope.listenerMiddleware,
        root: rootReducer,
        options: scope.options
      };
    }
  }

  return Object.seal(provider);
})();
