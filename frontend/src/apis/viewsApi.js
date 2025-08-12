import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASIC_URL } from "./userApi";

export const viewsApi = createApi({
  reducerPath: "viewsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:5000/views`,
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
  }),
});

export const {
  useGetAllViewsQuery,
  useGetViewByIdQuery,
  useAddViewMutation,
  useUpdateViewMutation,
  useDeleteViewMutation,
} = viewsApi;