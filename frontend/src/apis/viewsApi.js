import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { URL } from "../../config";

export const viewsApi = createApi({
  reducerPath: "viewsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${URL}views`,
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
  tagTypes: ["Views"],
  endpoints: (builder) => ({
    getAllViews: builder.query({
      query: () => "/",
      providesTags: ["Views"],
    }),
    getViewById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Views"],
    }),
    addView: builder.mutation({
      query: (newView) => ({
        url: "/",
        method: "POST",
        body: newView,
      }),
      invalidatesTags: ["Views"],
    }),
    updateView: builder.mutation({
      query: ({ id, ...updatedView }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: updatedView,
      }),
      invalidatesTags: ["Views"],
    }),
    deleteView: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Views"],
    }),

    getViewsByDate: builder.query({
      query: (date) => ({
        url: "/date",
        method: "POST",
        body: { date },
      }),
      providesTags: ["Views"],
    }),

    // Новые запросы для получения просмотров по локациям
    getViewsFromMonopoly: builder.query({
      query: () => "/monopoly",
      providesTags: ["Views"],
    }),

    getViewsFromJungle: builder.query({
      query: () => "/jungle",
      providesTags: ["Views"],
    }),

    getViewsFromBunker: builder.query({
      query: () => "/bunker",
      providesTags: ["Views"],
    }),
  }),
});

export const {
  useGetAllViewsQuery,
  useGetViewByIdQuery,
  useAddViewMutation,
  useUpdateViewMutation,
  useDeleteViewMutation,
  useGetViewsByDateQuery,
  useGetViewsFromMonopolyQuery,
  useGetViewsFromJungleQuery,
  useGetViewsFromBunkerQuery
} = viewsApi;