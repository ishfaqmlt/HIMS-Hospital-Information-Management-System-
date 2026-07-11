import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDoctors } from "@/services/doctors.service";

// 🔹 Async fetch
export const fetchDoctors = createAsyncThunk("doctors/fetchDoctors", async () => {
  const response = await getDoctors();
  return response;
});

const doctorSlice = createSlice({
  name: "doctors",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default doctorSlice.reducer;