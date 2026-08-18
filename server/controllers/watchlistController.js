const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/watchlist
 * @desc    Get the user's watchlist with live stock data
 * @access  Private
 */
const getWatchlist = asyncHandler(async (req, res) => {
  let watchlist = await Watchlist.findOne({ user: req.user._id }).populate({
    path: 'stocks',
    select: 'symbol name price change changePercent sector marketCap volume week52High week52Low',
  });

  if (!watchlist) {
    watchlist = await Watchlist.create({ user: req.user._id, stocks: [] });
  }

  res.json({ watchlist });
});

/**
 * @route   POST /api/watchlist/:stockId
 * @desc    Add a stock to the watchlist
 * @access  Private
 */
const addToWatchlist = asyncHandler(async (req, res) => {
  const stock = await Stock.findById(req.params.stockId);
  if (!stock) {
    return res.status(404).json({ message: 'Stock not found' });
  }

  let watchlist = await Watchlist.findOne({ user: req.user._id });
  if (!watchlist) {
    watchlist = await Watchlist.create({ user: req.user._id, stocks: [] });
  }

  if (!watchlist.stocks.some((id) => id.toString() === stock._id.toString())) {
    watchlist.stocks.push(stock._id);
    await watchlist.save();
  }

  const populated = await Watchlist.findById(watchlist._id).populate({
    path: 'stocks',
    select: 'symbol name price change changePercent sector marketCap volume week52High week52Low',
  });
  res.json({ watchlist: populated });
});

/**
 * @route   DELETE /api/watchlist/:stockId
 * @desc    Remove a stock from the watchlist
 * @access  Private
 */
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const watchlist = await Watchlist.findOne({ user: req.user._id });
  if (!watchlist) {
    return res.status(404).json({ message: 'Watchlist not found' });
  }

  watchlist.stocks = watchlist.stocks.filter(
    (id) => id.toString() !== req.params.stockId
  );
  await watchlist.save();

  const populated = await Watchlist.findById(watchlist._id).populate({
    path: 'stocks',
    select: 'symbol name price change changePercent sector marketCap volume week52High week52Low',
  });
  res.json({ watchlist: populated });
});

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
