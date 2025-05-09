import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const BASIC_URL = "https://apocrypha.su"

export const casesApi = createApi({
  reducerPath: "casesApi",
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
  tagTypes: ["Case"],
  endpoints: (builder) => ({
    // Получение всех дел (полная версия)
    getCases: builder.query({
      query: () => "/",
      providesTags: ["Case"],
    }),

    // Получение сокращенного списка дел
    getShortCases: builder.query({
      query: () => "/cases/short",
      providesTags: ["Case"],
    }),

    // Получение конкретного дела по ID
    getCase: builder.query({
      query: (id) => `/cases/${id}`,
      providesTags: (result, error, id) => [{ type: "Case", id }],
    }),

    // Создание нового дела
    addCase: builder.mutation({
      query: (newCase) => ({
        url: "/cases",
        method: "POST",
        body: newCase,
      }),
      invalidatesTags: ["Case"],
    }),

    // Обновление дела
    updateCase: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Case",
        { type: "Case", id },
      ],
    }),
  }),
});

// Экспорт хуков для использования в компонентах
export const {
  useGetCasesQuery,
  useGetShortCasesQuery,
  useGetCaseQuery,
  useAddCaseMutation,
  useUpdateCaseMutation,
} = casesApi;
