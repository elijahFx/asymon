import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASIC_URL = "http://localhost:5000/";

export const bunkerEventsApi = createApi({
  reducerPath: "bunkerEventsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASIC_URL,
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
  tagTypes: ["Events"],
  endpoints: (builder) => ({
    getBunkerEvents: builder.query({
      query: () => "/bunker",
      providesTags: ["Events"],
    }),
    getSingleBunkerEvent: builder.query({
      query: (id) => `/bunker/${id}`,
      providesTags: ["Events"],
    }),
    addBunkerEvent: builder.mutation({
      query: (newEvent) => ({
        url: "/bunker",
        method: "POST",
        body: newEvent,
      }),
      invalidatesTags: ["Events"],
    }),
    updateBunkerEvent: builder.mutation({
      query: ({ id, ...updatedEvent }) => ({
        url: `/bunker/${id}`,
        method: "PUT",
        body: updatedEvent,
      }),
      invalidatesTags: ["Events"],
    }),
    deleteBunkerEvent: builder.mutation({
      query: (id) => ({
        url: `/bunker/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),
  }),
});

export const {
  useGetBunkerEventsQuery,
  useGetSingleBunkerEventQuery,
  useAddBunkerEventMutation,
  useUpdateBunkerEventMutation,
  useDeleteBunkerEventMutation,
} = bunkerEventsApi;
