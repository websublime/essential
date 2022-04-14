import { configureStore, createSlice, combineReducers } from '@reduxjs/toolkit';

const rootSlice = createSlice({
  name: '@root',
  initialState: {},
  reducers: {}
});

const rootReducer = combineReducers({})
// export type RootState = ReturnType<typeof rootReducer>

export const initStore = () => {
  return configureStore({
    devTools: process.env.NODE_ENV !== 'production',
    reducer: {}
  });
}

const store = initStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
