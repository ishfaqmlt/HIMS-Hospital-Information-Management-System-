import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import departmentsReducer from "./slices/departmentsSlice";
import masterTestsReducer from "./slices/masterTestsSlice";
import doctorReducer from "./slices/doctorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    departments: departmentsReducer,
    masterTests: masterTestsReducer,
    fetchDoctors: doctorReducer,
  },
});
