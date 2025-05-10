import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { userApi } from "./apis/userApi";
import { eventsApi } from "./apis/eventsApi";
import casesReducer from "./slices/casesSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    cases: casesReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(eventsApi.middleware),
});

setupListeners(store.dispatch);
