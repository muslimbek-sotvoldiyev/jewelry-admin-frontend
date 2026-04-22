import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const API_URL = "/api"; // ✅ to'g'rilandi

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// 🔑 LOGIN
export const login = createAsyncThunk<LoginResponse, { email: string; password: string }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/users/login`, { // ✅ to'g'rilandi
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

// 🔑 REFRESH TOKEN
export const refreshAccessToken = createAsyncThunk<LoginResponse, string>(
  'auth/refresh',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/users/refresh`, { // ✅ to'g'rilandi
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return rejectWithValue('Token refresh failed');

      const data: LoginResponse = await response.json();

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Token refresh failed');
    }
  }
);

// 🔑 SLICE
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },
    setTokensFromStorage(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = !!action.payload.accessToken;
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Login failed';
      })

      // REFRESH TOKEN
      .addCase(refreshAccessToken.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.accessToken = action.payload.accessToken;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, setTokensFromStorage, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
