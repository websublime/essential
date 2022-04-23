/**
 * Copyright Websublime All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { AnyAction, ConfigureStoreOptions } from '@reduxjs/toolkit';
import { defineStoreOptions } from './config';
import { isSsr } from './helpers';
import { EssentialStore } from './store';

declare global {
  interface EssentialReducer {
    dispatch(action: AnyAction): void;
    getState(): unknown;
  }

  interface EssentialStoreObject {
    store: EssentialStore;
    isStoreAvailable: () => boolean;
  }

  interface Window {
    essential: EssentialStoreObject;
  }
}

const context: { essential?: EssentialStoreObject } = isSsr() ? {} : (window.top || window);

const isStoreAvailable = () => {
  return !!context.essential?.store;
}

export const useStore = (storeOptions: ConfigureStoreOptions = {} as ConfigureStoreOptions) => {
  if(!context.essential) {
    defineStoreOptions(storeOptions);

    context.essential = {
      store: new EssentialStore(),
      isStoreAvailable: isStoreAvailable
    };
  }

  return context.essential.store;
}
