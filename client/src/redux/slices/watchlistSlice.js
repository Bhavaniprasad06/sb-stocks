import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const fetchWatchlist = createAsyncThunk('watchlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/watchlist');
    return data.watchlist.stocks;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addToWatchlist = createAsyncThunk('watchlist/add', async (stockId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/watchlist/${stockId}`);
    return data.watchlist.stocks;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const removeFromWatchlist = createAsyncThunk('watchlist/remove', async (stockId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/watchlist/${stockId}`);
    return data.watchlist.stocks;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  stocks: [],
  status: 'idle',
  error: null,
};

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stocks = action.payload;
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.stocks = action.payload;
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.stocks = action.payload;
      });
  },
});

export default watchlistSlice.reducer;
