import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { userApi } from "./apis/userApi";
import { monopolyEventsApi } from "./apis/monopolyEventsApi";
import { jungleEventsApi } from "./apis/jungleEventsApi";
import { bunkerEventsApi } from "./apis/bunkerEventsApi";
import { waitingsApi } from "./apis/waitingsApi";
import { viewsApi } from "./apis/viewsApi";
import { smsApi } from "./apis/smsApi";
import authReducer from "./slices/authSlice";
import smsReducer from "./slices/smsSlice"


export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [monopolyEventsApi.reducerPath]: monopolyEventsApi.reducer,
    [jungleEventsApi.reducerPath]: jungleEventsApi.reducer,
    [bunkerEventsApi.reducerPath]: bunkerEventsApi.reducer,
    [waitingsApi.reducerPath]: waitingsApi.reducer,
    [viewsApi.reducerPath]: viewsApi.reducer,
    [smsApi.reducerPath]: smsApi.reducer,
    auth: authReducer,
    sms: smsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(monopolyEventsApi.middleware)
      .concat(jungleEventsApi.middleware)
      .concat(bunkerEventsApi.middleware)
      .concat(waitingsApi.middleware)
      .concat(viewsApi.middleware)
      .concat(smsApi.middleware)
});

setupListeners(store.dispatch);
