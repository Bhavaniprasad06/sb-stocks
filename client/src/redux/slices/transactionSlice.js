import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetch',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/transactions?page=${page}&limit=${limit}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  transactions: [],
  total: 0,
  page: 1,
  pages: 1,
  status: 'idle',
  error: null,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.transactions = action.payload.transactions;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default transactionSlice.reducer;
