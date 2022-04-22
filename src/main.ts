import { AnyAction } from '@reduxjs/toolkit';
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
  }

  interface Window {
    essential: EssentialStoreObject;
  }
}

const context: { essential?: EssentialStoreObject } = isSsr() ? {} : (window.top || window);

const isStoreAvailable = () => {
  return !!context.essential?.store;
}

export const useStore = (env: Environment = 'local') => {
  if(!context.essential) {
    context.essential = {
      store: new EssentialStore(env),
      isStoreAvailable: isStoreAvailable
    };
  }

  return context.essential.store;
}
