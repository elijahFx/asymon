import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { userApi } from "./apis/userApi";
import { monopolyEventsApi } from "./apis/monopolyEventsApi";
import { jungleEventsApi } from "./apis/jungleEventsApi";
import { bunkerEventsApi } from "./apis/bunkerEventsApi";
import casesReducer from "./slices/casesSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [monopolyEventsApi.reducerPath]: monopolyEventsApi.reducer,
    [jungleEventsApi.reducerPath]: jungleEventsApi.reducer,
    [bunkerEventsApi.reducerPath]: bunkerEventsApi.reducer,
    cases: casesReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(monopolyEventsApi.middleware)
      .concat(jungleEventsApi.middleware)
      .concat(bunkerEventsApi.middleware),
});

setupListeners(store.dispatch);
