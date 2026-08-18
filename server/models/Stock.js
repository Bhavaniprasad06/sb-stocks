const mongoose = require('mongoose');

/**
 * Stock model — a single tradable US stock listing with price history.
 */
const pricePointSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Symbol is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    change: {
      type: Number,
      default: 0,
    },
    changePercent: {
      type: Number,
      default: 0,
    },
    open: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    previousClose: { type: Number, default: 0 },
    volume: { type: Number, default: 0 },
    marketCap: { type: Number, default: 0 },
    sector: { type: String, default: 'General', trim: true },
    industry: { type: String, default: '', trim: true },
    week52High: { type: Number, default: 0 },
    week52Low: { type: Number, default: 0 },
    history: {
      type: [pricePointSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastFetchedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Stock', stockSchema);
