import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { URL } from "../../config";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${URL}`,
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
  tagTypes: ["User"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    signup: builder.mutation({
      query: (newUserData) => ({
        url: "/users/signup",
        method: "POST",
        body: newUserData,
      }),
      invalidatesTags: ["User"],
    }),

    getCurrentUser: builder.query({
      query: () => "/users/me",
      providesTags: ["User"],
    }),

    uploadAvatar: builder.mutation({
      query: (imageFile) => {
        const formData = new FormData();
        formData.append("avatar", imageFile);
        return {
          url: "/users/avatar",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["User"],
    }),

    updateUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    deleteAvatar: builder.mutation({
      query: () => ({
        url: "/users/avatar",
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    getUsersStatistics: builder.query({
      query: (id) => `users/${id}/statistics`,
      providesTags: ["User"],
    }),

    getAllUsers: builder.query({
      query: () => "/users",
      providesTags: ["User"],
    }),

    editUserLikeAdmin: builder.mutation({
      query: (userData) => ({
        url: `/users/adm`,
        method: "PATCH",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: "/users",
        method: "DELETE",
        body: { id }, 
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGetCurrentUserQuery,
  useUploadAvatarMutation,
  useUpdateUserMutation,
  useDeleteAvatarMutation,
  useGetUsersStatisticsQuery,
  useGetAllUsersQuery,
  useEditUserLikeAdminMutation,
  useDeleteUserMutation,
} = userApi;
