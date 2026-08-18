import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

const TOKEN_KEY = 'sb_token';
const USER_KEY = 'sb_user';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async ({ name, email, password, contact }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', { name, email, password, contact });
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async ({ name, contact }, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/profile', { name, contact });
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  token: localStorage.getItem(TOKEN_KEY) || null,
  user: readUser(),
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
      })
      .addCase(fetchMe.rejected, (state) => {
        // Token no longer valid — clear session
        state.token = null;
        state.user = null;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export const selectAuth = (state) => state.auth;

export default authSlice.reducer;
