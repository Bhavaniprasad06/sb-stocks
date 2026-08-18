const mongoose = require('mongoose');

/**
 * Portfolio model — current holdings per user.
 * One document per user; holdings reference stocks and track average cost.
 */
const holdingSchema = new mongoose.Schema(
  {
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true,
    },
    shares: {
      type: Number,
      required: true,
      min: [0, 'Shares cannot be negative'],
    },
    avgPrice: {
      type: Number,
      required: true,
      min: [0, 'Average price cannot be negative'],
    },
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    holdings: {
      type: [holdingSchema],
      default: [],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
