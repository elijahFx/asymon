// casesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  consumerSurname: undefined,
  consumerNameAndThirdName: undefined,
  consumerPhone: undefined,
  consumerAddress: undefined,
  consumerEmail: undefined,
  sellerName: undefined,
  sellerUnp: undefined,
  status: undefined,
  disputeType: undefined,
  disputeArea: undefined,
  employee: undefined,
  employeeWhoMadeTheSuite: undefined,
  employeeWhoMadeClaim: undefined,
  employeeWhoMadeAppeal: undefined,
  employeeWhoMadeOPI: undefined,
};

const casesSlice = createSlice({
  name: "cases",
  initialState,
  reducers: {
    addNewInfoToCase(state, action) {
      return { ...state, ...action.payload };
    },
    updateConsumerInfo(state, action) {
      state.consumerSurname = action.payload.consumerSurname;
      state.consumerNameAndThirdName = action.payload.consumerNameAndThirdName;
      state.consumerPhone = action.payload.consumerPhone;
      state.consumerAddress = action.payload.consumerAddress;
      state.consumerEmail = action.payload.consumerEmail;
    },
    updateSellerInfo(state, action) {
      state.sellerName = action.payload.sellerName;
      state.sellerUnp = action.payload.sellerUnp;
    },
    updateCaseInfo(state, action) {
      state.status = action.payload.status;
      state.disputeType = action.payload.disputeType;
      state.disputeArea = action.payload.disputeArea;
      state.employee = action.payload.employee;
      state.employeeWhoMadeTheSuite = action.payload.employeeWhoMadeTheSuite;
      state.employeeWhoMadeClaim = action.payload.employeeWhoMadeClaim;
      state.employeeWhoMadeAppeal = action.payload.employeeWhoMadeAppeal;
      state.employeeWhoMadeOPI = action.payload.employeeWhoMadeOPI;
    },
    clearCaseInfo(state, action) {
      return initialState;
    },
  },
});

export const {
  addNewInfoToCase,
  updateConsumerInfo,
  updateSellerInfo,
  updateCaseInfo,
  clearCaseInfo,
} = casesSlice.actions;

export default casesSlice.reducer;
