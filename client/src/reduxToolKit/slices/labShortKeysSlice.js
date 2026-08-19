import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import labShortKeyService from "@/services/labShortKey.service";

export const fetchLabShortKeys = createAsyncThunk(
  "labShortKeys/fetchLabShortKeys",
  async (_, { rejectWithValue }) => {
    try {
      const response = await labShortKeyService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch lab short keys");
    }
  }
);

const labShortKeysSlice = createSlice({
  name: "labShortKeys",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLabShortKeys.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabShortKeys.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.data && Array.isArray(action.payload.data) ? action.payload.data : []);
      })
      .addCase(fetchLabShortKeys.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default labShortKeysSlice.reducer;
