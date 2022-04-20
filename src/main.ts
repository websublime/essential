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

const context: { essential?: EssentialStoreObject } = isSsr() ? {} : (window.top || window);

export const useStore = (env: Environment = 'local') => {
  if(!context.essential) {
    context.essential = {
      store: new EssentialStore(env)
    };
  }

  return context.essential.store;
}
