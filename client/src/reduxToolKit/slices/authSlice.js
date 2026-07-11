import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

const initialState = {
  user: null,
  token: null,
  roles: [],
  permissions: [],
  isLoggedIn: false,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/login", credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Login failed" }
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/register", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Registration failed" }
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/logout");
    } catch (error) {
      // Logout even if API fails (token may be expired)
    }
  }
);

export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch user" }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrate(state) {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        const roles = localStorage.getItem("roles");
        const permissions = localStorage.getItem("permissions");

        state.user = user ? JSON.parse(user) : null;
        state.token = token || null;
        state.roles = roles ? JSON.parse(roles) : [];
        state.permissions = permissions ? JSON.parse(permissions) : [];
        state.isLoggedIn = !!token;
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.roles = action.payload.roles || [];
        state.permissions = action.payload.permissions || [];
        state.isLoggedIn = true;

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          localStorage.setItem("token", action.payload.token);
          localStorage.setItem(
            "roles",
            JSON.stringify(action.payload.roles || [])
          );
          localStorage.setItem(
            "permissions",
            JSON.stringify(action.payload.permissions || [])
          );
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.roles = action.payload.roles || [];
        state.permissions = action.payload.permissions || [];
        state.isLoggedIn = true;

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          localStorage.setItem("token", action.payload.token);
          localStorage.setItem(
            "roles",
            JSON.stringify(action.payload.roles || [])
          );
          localStorage.setItem(
            "permissions",
            JSON.stringify(action.payload.permissions || [])
          );
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.roles = [];
        state.permissions = [];
        state.isLoggedIn = false;

        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("roles");
          localStorage.removeItem("permissions");
        }
      })
      // Fetch User
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.roles = action.payload.roles || [];
        state.permissions = action.payload.permissions || [];

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload));
          localStorage.setItem(
            "roles",
            JSON.stringify(action.payload.roles || [])
          );
          localStorage.setItem(
            "permissions",
            JSON.stringify(action.payload.permissions || [])
          );
        }
      })
      .addCase(fetchUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.roles = [];
        state.permissions = [];
        state.isLoggedIn = false;

        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("roles");
          localStorage.removeItem("permissions");
        }
      });
  },
});

export const { hydrate, clearError } = authSlice.actions;
export default authSlice.reducer;
