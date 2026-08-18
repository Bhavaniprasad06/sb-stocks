const mongoose = require('mongoose');

/**
 * Watchlist model — stocks a user follows without owning them.
 */
const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    stocks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Watchlist', watchlistSchema);
