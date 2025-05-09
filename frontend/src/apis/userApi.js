import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const BASIC_URL = "https://apocrypha.su"

export const userApi = createApi({
  reducerPath: "userApi",
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
  tagTypes: ["User"], // Добавляем тег для автоматического обновления данных
  endpoints: (builder) => ({
    // Аутентификация
    login: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"], // При логине обновляем данные пользователя
    }),

    // Получение текущего пользователя
    getCurrentUser: builder.query({
      query: () => "/users/me",
      providesTags: ["User"], // Указываем, что запрос связан с тегом 'User'
    }),

    // Работа с аватаром
    uploadAvatar: builder.mutation({
      query: (imageFile) => {
        const formData = new FormData();
        formData.append("avatar", imageFile);

        return {
          url: "/users/avatar",
          method: "POST",
          body: formData,
          // Для FormData заголовок Content-Type устанавливается автоматически
        };
      },
      invalidatesTags: ["User"], // После загрузки обновляем данные пользователя
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
      providesTags: ["User"], // также указываем тег, если нужно обновление
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useUploadAvatarMutation,
  useUpdateUserMutation,
  useDeleteAvatarMutation,
  useGetUsersStatisticsQuery
} = userApi;
