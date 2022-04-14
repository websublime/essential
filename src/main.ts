import { isSsr } from "./helpers";
import { EssentialStore } from "./store";
import { Environment } from "./types";

declare global {
  interface EssentialStoreObject {
    store: EssentialStore;
  }

  interface Window {
    essential: EssentialStoreObject;
  }
}

const context = isSsr() ? { essential: null } : (window.top || window);

const useStore = (env: Environment = 'local') => {
  if(!context?.essential) {
    Object.defineProperty(context, 'essential', {
      get() {
        return {
          store: new EssentialStore(env)
        }
      }
    });
  }

  return context?.essential?.store;
}