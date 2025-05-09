import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,         // Никнейм пользователя
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  avatar: null,
  status: null,
  rank: null,
  id: null,
  fullName: null,
  timestamp: null,
  createdAt: null,
  caseCount: 0,
  caseStatuses: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      // Если в payload передали поле user, используем его,
      // иначе ожидаем наличие поля nickname
      const user = action.payload.user || action.payload.nickname;
      state.user = user || state.user;
      state.token = action.payload.token || state.token;
      state.id = action.payload.id || state.id;
      state.avatar = action.payload.avatar || state.avatar;
      state.rank = action.payload.rank || state.rank;
      state.status = action.payload.status || state.status;
      state.fullName = action.payload.fullName || state.fullName;
      state.isAuthenticated = true;
      state.timestamp = Date.now()
      state.createdAt = action.payload.createdAt
      state.caseCount = action.payload.caseCount
      state.caseStatuses = action.payload.caseStatuses
      
      // Сохраняем актуальное состояние авторизации в localStorage
      localStorage.setItem(
        "userASY",
        JSON.stringify({
          user: state.user,
          token: state.token,
          id: state.id,
          avatar: state.avatar,
          rank: state.rank,
          status: state.status,
          fullName: state.fullName,
          isAuthenticated: true,
          timestamp: Date.now(),
          createdAt: state.createdAt,
          caseCount: state.caseCount,
          caseStatuses: state.caseStatuses
        })
      );
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.id = null;
      state.avatar = null;
      state.rank = null;
      state.status = null;
      state.fullName = null;
      state.isAuthenticated = false;
      state.createdAt = null
      state.caseCount = 0
      state.caseStatuses = null
      localStorage.removeItem("userASY");
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
