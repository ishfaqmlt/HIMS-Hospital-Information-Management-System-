import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import doctorService from "@/services/doctor.service";
import departmentService from "@/services/department.service";
import serviceService from "@/services/serviceService";
import serviceChargeService from "@/services/serviceChargeService";

export const fetchBillingDoctors = createAsyncThunk(
  "billingData/fetchDoctors",
  async () => {
    const res = await doctorService.getAll();
    return res.data;
  }
);

export const fetchBillingDepartments = createAsyncThunk(
  "billingData/fetchDepartments",
  async () => {
    const res = await departmentService.getAll();
    return res.data;
  }
);

export const fetchBillingServices = createAsyncThunk(
  "billingData/fetchServices",
  async () => {
    const res = await serviceService.getAll();
    return res.data;
  }
);

export const fetchBillingServiceCharges = createAsyncThunk(
  "billingData/fetchServiceCharges",
  async () => {
    const res = await serviceChargeService.getAll();
    return res.data;
  }
);

const billingDataSlice = createSlice({
  name: "billingData",
  initialState: {
    doctors: [],
    departments: [],
    services: [],
    serviceCharges: [],
    loading: false,
  },
  reducers: {
    resetBillingData: (state) => {
      state.doctors = [];
      state.departments = [];
      state.services = [];
      state.serviceCharges = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillingDoctors.fulfilled, (state, action) => {
        state.doctors = action.payload;
      })
      .addCase(fetchBillingDepartments.fulfilled, (state, action) => {
        state.departments = action.payload;
      })
      .addCase(fetchBillingServices.fulfilled, (state, action) => {
        state.services = action.payload;
      })
      .addCase(fetchBillingServiceCharges.fulfilled, (state, action) => {
        state.serviceCharges = action.payload;
      });
  },
});

export const { resetBillingData } = billingDataSlice.actions;
export default billingDataSlice.reducer;
