import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASIC_URL = "http://localhost:5000/";

export const jungleEventsApi = createApi({
  reducerPath: "jungleEventsApi",
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
    getJungleEvents: builder.query({
      query: () => "/jungle",
      providesTags: ["Events"],
    }),
    getSingleJungleEvent: builder.query({
      query: (id) => `/jungle/${id}`,
      providesTags: ["Events"],
    }),
    addJungleEvent: builder.mutation({
      query: (newEvent) => ({
        url: "/jungle",
        method: "POST",
        body: newEvent,
      }),
      invalidatesTags: ["Events"],
    }),
    updateJungleEvent: builder.mutation({
      query: ({ id, ...updatedEvent }) => ({
        url: `/jungle/${id}`,
        method: "PUT",
        body: updatedEvent,
      }),
      invalidatesTags: ["Events"],
    }),
    deleteJungleEvent: builder.mutation({
      query: (id) => ({
        url: `/jungle/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),
  }),
});

export const {
  useGetJungleEventsQuery,
  useGetSingleJungleEventQuery,
  useAddJungleEventMutation,
  useUpdateJungleEventMutation,
  useDeleteJungleEventMutation,
} = jungleEventsApi;
