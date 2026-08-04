import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import masterTestService from "@/services/masterTests.service";

export const fetchMasterTests = createAsyncThunk(
  "masterTests/fetchMasterTests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await masterTestService.getAll();
      return res.data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const masterTestsSlice = createSlice({
  name: "masterTests",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    setMasterTests: (state, action) => {
      state.list = action.payload;
    },
    clearMasterTests: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterTests.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchMasterTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setMasterTests, clearMasterTests } = masterTestsSlice.actions;

export default masterTestsSlice.reducer;
