/**
 * Copyright Websublime All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { AnyAction, configureStore, ConfigureStoreOptions, createListenerMiddleware, createReducer, Store } from '@reduxjs/toolkit';
import { defineStoreOptions, config } from './config';

const listenerMiddleware = createListenerMiddleware();

const rootReducer = createReducer<Record<string, any>>({}, (builder) => {
  builder.addDefaultCase((state) => {
    return state;
  });
});

const redux: Store<RootState, AnyAction> = configureStore(defineStoreOptions({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  }).prepend(listenerMiddleware.middleware),
  ...config
}) as ConfigureStoreOptions);

export type RootState = ReturnType<typeof rootReducer>;
export const useRedux = () => ({middleware: listenerMiddleware, store: redux});
