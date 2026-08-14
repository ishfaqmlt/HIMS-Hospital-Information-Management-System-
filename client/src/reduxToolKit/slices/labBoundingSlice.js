import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import labBoundingService from "@/services/labBounding.service";

export const fetchLabBoundings = createAsyncThunk(
  "labBoundings/fetchLabBoundings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await labBoundingService.getAll();
      return response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lab boundings"
      );
    }
  }
);

const labBoundingSlice = createSlice({
  name: "labBoundings",
  initialState: {
    boundings: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetLabBoundingsState: (state) => {
      state.boundings = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLabBoundings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabBoundings.fulfilled, (state, action) => {
        state.loading = false;
        state.boundings = action.payload;
      })
      .addCase(fetchLabBoundings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetLabBoundingsState } = labBoundingSlice.actions;
export default labBoundingSlice.reducer;
