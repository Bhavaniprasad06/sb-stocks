import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

const normalizeHoldings = (holdings) =>
  holdings.map((h) => ({
    stockId: h.stock?._id || h.stockId,
    symbol: h.stock?.symbol || h.symbol,
    name: h.stock?.name || h.name,
    sector: h.stock?.sector || h.sector,
    shares: h.shares,
    avgPrice: h.avgPrice,
    currentPrice: h.stock?.price || h.currentPrice,
    marketValue: +(h.shares * (h.stock?.price || h.currentPrice)).toFixed(2),
    costBasis: +(h.shares * h.avgPrice).toFixed(2),
    gainLoss: +(h.shares * (h.stock?.price || h.currentPrice) - h.shares * h.avgPrice).toFixed(2),
    gainLossPercent: h.shares * h.avgPrice
      ? +((((h.stock?.price || h.currentPrice) - h.avgPrice) / h.avgPrice) * 100).toFixed(2)
      : 0,
  }));

export const fetchPortfolio = createAsyncThunk('portfolio/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/portfolio');
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchPerformance = createAsyncThunk('portfolio/performance', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/portfolio/performance');
    return data.series;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const placeTrade = createAsyncThunk(
  'portfolio/trade',
  async ({ stockId, shares, type }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/transactions/${type}`, { stockId, shares });
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  cash: 0,
  positionsValue: 0,
  totalValue: 0,
  totalGainLoss: 0,
  totalReturnPercent: 0,
  holdings: [],
  performance: [],
  status: 'idle',
  trading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cash = action.payload.cash;
        state.positionsValue = action.payload.positionsValue;
        state.totalValue = action.payload.totalValue;
        state.totalGainLoss = action.payload.totalGainLoss;
        state.totalReturnPercent = action.payload.totalReturnPercent;
        state.holdings = action.payload.holdings;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchPerformance.fulfilled, (state, action) => {
        state.performance = action.payload;
      })
      .addCase(placeTrade.pending, (state) => {
        state.trading = true;
        state.error = null;
      })
      .addCase(placeTrade.fulfilled, (state, action) => {
        state.trading = false;
        state.cash = action.payload.cash;
        // Normalize holdings to the same shape used by fetchPortfolio
        state.holdings = action.payload.portfolio.holdings.map((h) => ({
          stockId: h.stock._id,
          symbol: h.stock.symbol,
          name: h.stock.name,
          sector: h.stock.sector,
          shares: h.shares,
          avgPrice: h.avgPrice,
          currentPrice: h.stock.price,
          marketValue: +(h.shares * h.stock.price).toFixed(2),
          costBasis: +(h.shares * h.avgPrice).toFixed(2),
          gainLoss: +(h.shares * h.stock.price - h.shares * h.avgPrice).toFixed(2),
          gainLossPercent:
            h.shares * h.avgPrice
              ? +(((h.stock.price - h.avgPrice) / h.avgPrice) * 100).toFixed(2)
              : 0,
        }));
        state.positionsValue = state.holdings.reduce((sum, h) => sum + h.marketValue, 0);
        state.totalValue = +(state.cash + state.positionsValue).toFixed(2);
      })
      .addCase(placeTrade.rejected, (state, action) => {
        state.trading = false;
        state.error = action.payload;
      });
  },
});

export default portfolioSlice.reducer;
