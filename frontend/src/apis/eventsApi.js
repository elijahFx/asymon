import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const BASIC_URL = "https://apocrypha.su"

export const eventsApi = createApi({
  reducerPath: "eventsApi",
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
    getEvents: builder.query({
      query: () => "/events",
      providesTags: ["Events"],
    }),
    addEvent: builder.mutation({
      query: (newEvent) => ({
        url: "/events",
        method: "POST",
        body: newEvent,
      }),
      invalidatesTags: ["Events"],
    }),
    updateEvent: builder.mutation({
      query: ({ id, ...updatedEvent }) => ({
        url: `/events/${id}`,
        method: "PUT",
        body: updatedEvent,
      }),
      invalidatesTags: ["Events"],
    }),
    getSingleEvent: builder.query({
      query: (id) => `/events/${id}`,
      providesTags: ["Events"],
    }),
    getEventsByDate: builder.query({
      query: (date) => ({
        url: `/events/dates`,
        method: "GET",
        params: { date },
      }),
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetSingleEventQuery,
  useGetEventsByDateQuery,
  useAddEventMutation,
  useUpdateEventMutation,
} = eventsApi;
