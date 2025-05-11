import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASIC_URL = "http://localhost:5000/";

export const monopolyEventsApi = createApi({
  reducerPath: "monopolyEventsApi",
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
    getMonopolyEvents: builder.query({
      query: () => "/monopoly",
      providesTags: ["Events"],
    }),
    getSingleMonopolyEvent: builder.query({
      query: (id) => `/monopoly/${id}`,
      providesTags: ["Events"],
    }),
    addMonopolyEvent: builder.mutation({
      query: (newEvent) => ({
        url: "/monopoly",
        method: "POST",
        body: newEvent,
      }),
      invalidatesTags: ["Events"],
    }),
    updateMonopolyEvent: builder.mutation({
      query: ({ id, ...updatedEvent }) => ({
        url: `/monopoly/${id}`,
        method: "PUT",
        body: updatedEvent,
      }),
      invalidatesTags: ["Events"],
    }),
    deleteMonopolyEvent: builder.mutation({
      query: (id) => ({
        url: `/monopoly/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),
  }),
});

export const {
  useGetMonopolyEventsQuery,
  useGetSingleMonopolyEventQuery,
  useAddMonopolyEventMutation,
  useUpdateMonopolyEventMutation,
  useDeleteMonopolyEventMutation,
} = monopolyEventsApi;
