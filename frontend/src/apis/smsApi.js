import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASIC_URL } from "./userApi";

export const smsApi = createApi({
  reducerPath: "smsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `https://coursehunters.by/sms/`,
    prepareHeaders: (headers) => {
      const userInfo = localStorage.getItem("userASY");
      const userInfoJSON = JSON.parse(userInfo || '{}');
      const token = userInfoJSON?.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["SMS"],
  endpoints: (builder) => ({
    // Отправка SMS
    sendSMS: builder.mutation({
      query: ({ phone, message }) => ({
        url: "/sendone",
        method: "POST",
        body: { phone, message },
      }),
      invalidatesTags: ["SMS"],
    }),

    sendSMSBulk: builder.mutation({
      query: ({ phones, message }) => ({
        url: "/sendmultiple",
        method: "POST",
        body: { phones, message },
      }),
      invalidatesTags: ["SMS"],
    }),

    // Проверка статуса SMS
    getSMSStatus: builder.query({
      query: (smsId) => `/status/${smsId}`,
      providesTags: (result, error, smsId) => [{ type: "SMS", id: smsId }],
    }),

    // Получение баланса
    getBalance: builder.query({
      query: () => "/balance",
      providesTags: ["SMS"],
    }),

    // Получение списка альфа-имен
    getSenders: builder.query({
      query: () => "/senders",
      providesTags: ["SMS"],
    }),

    // Добавление альфа-имени
    addSender: builder.mutation({
      query: (sender) => ({
        url: "/senders",
        method: "POST",
        body: { sender },
      }),
      invalidatesTags: ["SMS"],
    }),

    // Получение списка шаблонов
    getTemplates: builder.query({
      query: () => "/templates",
      providesTags: ["SMS"],
    }),
  }),
});

// Экспорт хуков для использования в компонентах
export const {
  useSendSMSMutation,
  useGetSMSStatusQuery,
  useGetBalanceQuery,
  useGetSendersQuery,
  useAddSenderMutation,
  useGetTemplatesQuery,
  useSendSMSBulkMutation
} = smsApi;