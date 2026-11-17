import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./api/baseApi";
import authReducer from "./features/authSlice";
import progressReducer from "./features/progressSlice";

export const PROGRESS_STORAGE_KEY = "mu:progress";

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
      progress: progressReducer,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });

  setupListeners(store.dispatch);

  // Persist lesson progress on this device.
  if (typeof window !== "undefined") {
    let previous = store.getState().progress;
    store.subscribe(() => {
      const next = store.getState().progress;
      if (next !== previous) {
        previous = next;
        try {
          window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Storage can be full or disabled; progress just won't persist.
        }
      }
    });
  }

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
