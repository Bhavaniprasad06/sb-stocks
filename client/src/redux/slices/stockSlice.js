import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const fetchStocks = createAsyncThunk(
  'stocks/fetch',
  async ({ search = '', sector = '', sort = '', page = 1, limit = 30 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.set('search', search);
      if (sector) params.set('sector', sector);
      if (sort) params.set('sort', sort);
      const { data } = await api.get(`/stocks?${params.toString()}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStockHistory = createAsyncThunk(
  'stocks/history',
  async ({ symbol, period = '3M' }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/stocks/${symbol}/history?period=${period}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLiveStocks = createAsyncThunk(
  'stocks/live',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/stocks/live');
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSectors = createAsyncThunk('stocks/sectors', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/stocks/meta/sectors');
    return data.sectors;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchMovers = createAsyncThunk('stocks/movers', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/stocks/meta/movers');
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  stocks: [],
  total: 0,
  page: 1,
  pages: 1,
  sectors: [],
  movers: { gainers: [], losers: [], mostActive: [] },
  liveStocks: [],
  liveStocksLastUpdated: null,
  stockHistory: null,
  stockHistoryStatus: 'idle',
  status: 'idle',
  moversStatus: 'idle',
  liveStatus: 'idle',
  error: null,
};

const stockSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    clearStockHistory: (state) => {
      state.stockHistory = null;
      state.stockHistoryStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStocks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stocks = action.payload.stocks;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchStockHistory.pending, (state) => {
        state.stockHistoryStatus = 'loading';
      })
      .addCase(fetchStockHistory.fulfilled, (state, action) => {
        state.stockHistoryStatus = 'succeeded';
        state.stockHistory = action.payload;
      })
      .addCase(fetchStockHistory.rejected, (state) => {
        state.stockHistoryStatus = 'failed';
      })
      .addCase(fetchLiveStocks.fulfilled, (state, action) => {
        state.liveStocks = action.payload.stocks;
        state.liveStocksLastUpdated = action.payload.lastUpdated;
        state.liveStatus = 'succeeded';
      })
      .addCase(fetchSectors.fulfilled, (state, action) => {
        state.sectors = action.payload;
      })
      .addCase(fetchMovers.pending, (state) => {
        state.moversStatus = 'loading';
      })
      .addCase(fetchMovers.fulfilled, (state, action) => {
        state.moversStatus = 'succeeded';
        state.movers = action.payload;
      })
      .addCase(fetchMovers.rejected, (state) => {
        state.moversStatus = 'failed';
      });
  },
});

export const { clearStockHistory } = stockSlice.actions;
export default stockSlice.reducer;
