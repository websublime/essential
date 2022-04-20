import { createReducer } from "@reduxjs/toolkit";
import { ReducerWithInitialState } from "@reduxjs/toolkit/dist/createReducer";
import { uniqueID } from "./helpers";

export abstract class EssentialReducer {
  abstract get initial(): any;

  abstract get actions(): {action: any, type: any, defaults?: boolean}[];

  reducersMap: ReducerWithInitialState<any>;

  namespace = Symbol(uniqueID());

  constructor(key?: symbol) {
    this.reducersMap = this.initReducers();

    if(key) {
      this.namespace = key;
    }
  }

  initReducers() {
    return createReducer(this.initial, (builder) => {
      this.actions.forEach(item => {
        const { defaults = false } = item;

        defaults ? builder.addDefaultCase(item.action) : builder.addCase(item.type, item.action);
      });
    });
  }
}
