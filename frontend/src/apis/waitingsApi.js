import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASIC_URL } from "./userApi";

export const waitingsApi = createApi({
  reducerPath: "waitingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:5000/waitings`,
    prepareHeaders: (headers) => {
      const userInfo = localStorage.getItem("userASY");
      const userInfoJSON = JSON.parse(userInfo);
      const token = userInfoJSON?.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Waitings"],
  endpoints: (builder) => ({
    getAllWaitings: builder.query({
      query: () => "/",
      providesTags: ["Waitings"],
    }),
    getWaitingById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Waitings"],
    }),
    // Добавляем новый endpoint для поиска по дате
    getWaitingsByDate: builder.query({
      query: (date) => ({
        url: "/date",
        method: "POST",
        body: { date },
      }),
      providesTags: ["Waitings"],
    }),
    addWaiting: builder.mutation({
      query: (newWaiting) => ({
        url: "/",
        method: "POST",
        body: newWaiting,
      }),
      invalidatesTags: ["Waitings"],
    }),
    updateWaiting: builder.mutation({
      query: ({ id, ...updatedWaiting }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: updatedWaiting,
      }),
      invalidatesTags: ["Waitings"],
    }),
    deleteWaiting: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Waitings"],
    }),
  }),
});

export const {
  useGetAllWaitingsQuery,
  useGetWaitingByIdQuery,
  useGetWaitingsByDateQuery, // Экспортируем новый хук
  useAddWaitingMutation,
  useUpdateWaitingMutation,
  useDeleteWaitingMutation,
} = waitingsApi;