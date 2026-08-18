import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import stockReducer from './slices/stockSlice';
import portfolioReducer from './slices/portfolioSlice';
import watchlistReducer from './slices/watchlistSlice';
import transactionReducer from './slices/transactionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stocks: stockReducer,
    portfolio: portfolioReducer,
    watchlist: watchlistReducer,
    transactions: transactionReducer,
  },
});
