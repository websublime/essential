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
import { Environment } from './types';

declare global {
  interface EssentialReducer {
    dispatch(action: AnyAction): void;
    getState(): unknown;
  }

  interface EssentialStoreObject {
    store: EssentialStore;
    isStoreAvailable: () => boolean;
    options: Partial<ConfigureStoreOptions>;
  }

  interface Window {
    essential: EssentialStoreObject;
    environment: Environment;
  }
}

const context: { essential?: EssentialStoreObject } = isSsr() ? {} : (window.top || window);

const isStoreAvailable = () => {
  return !!context.essential?.store;
}

export const useStore = (storeOptions: Partial<ConfigureStoreOptions> = {}) => {
  if(!context.essential) {
    const options = defineStoreOptions(storeOptions);

    context.essential = Object.seal({
      store: new EssentialStore(),
      isStoreAvailable: isStoreAvailable,
      options
    });
  }

  return context.essential.store;
}
