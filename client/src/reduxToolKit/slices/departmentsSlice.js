import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDepartments } from "@/services/department.service";

// 🔹 Async fetch
export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDepartments();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const departmentsSlice = createSlice({
  name: "departments",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    setDepartments: (state, action) => {
      state.list = action.payload;
    },
    clearDepartments: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setDepartments, clearDepartments } =
  departmentsSlice.actions;

export default departmentsSlice.reducer;