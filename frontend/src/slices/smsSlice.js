import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  text: 'Здравствуйте. Пожалуйста, оставьте отзыв по адресу: https://support.google.com/localservices/answer/12488237?hl=RU', // Текст SMS сообщения
  sender: 'MONOPOLY.BY', // Отправитель по умолчанию
  lastUpdated: new Date().toISOString() // Время последнего обновления
};

const smsSlice = createSlice({
  name: 'sms',
  initialState,
  reducers: {
    // Установка текста сообщения
    setMessageText: (state, action) => {
      state.text = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Очистка сообщения
    clearMessage: (state) => {
      state.text = '';
      state.lastUpdated = new Date().toISOString();
    },
    
    // Установка отправителя
    setSender: (state, action) => {
      state.sender = action.payload;
    }
  }
});

// Экспорт действий
export const { setMessageText, clearMessage, setSender } = smsSlice.actions;

// Селекторы
export const selectMessageText = (state) => state.sms.text;
export const selectSender = (state) => state.sms.sender;
export const selectLastUpdated = (state) => state.sms.lastUpdated;

// Экспорт редюсера
export default smsSlice.reducer;