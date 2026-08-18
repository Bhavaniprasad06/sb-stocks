const mongoose = require('mongoose');

/**
 * Transaction model — every virtual buy/sell order placed by a user.
 */
const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true,
    },
    type: {
      type: String,
      enum: ['buy', 'sell'],
      required: true,
    },
    shares: {
      type: Number,
      required: true,
      min: [1, 'Shares must be at least 1'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    total: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
