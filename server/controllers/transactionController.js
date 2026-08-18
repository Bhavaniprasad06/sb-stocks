const User = require('../models/User');
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Shared logic for buy/sell.
 *
 * NOTE: operations are executed sequentially (not inside a multi-document
 * transaction) so the app works on a standalone MongoDB instance, which is
 * the default for the Windows installer. Validation happens before any write,
 * and the operations are order-sensitive to keep cash/holdings consistent.
 */
const executeTrade = async (req, res, type) => {
  const { stockId, shares } = req.body;
  const quantity = Number(shares);

  if (!stockId || !quantity || quantity <= 0 || !Number.isInteger(quantity)) {
    return res.status(400).json({ message: 'A valid positive whole number of shares is required' });
  }

  const stock = await Stock.findById(stockId);
  if (!stock) {
    return res.status(404).json({ message: 'Stock not found' });
  }

  const user = await User.findById(req.user._id);
  let portfolio = await Portfolio.findOne({ user: user._id });
  if (!portfolio) {
    portfolio = await Portfolio.create({ user: user._id, holdings: [] });
  }

  const price = stock.price;
  const total = +(price * quantity).toFixed(2);
  const holding = portfolio.holdings.find(
    (h) => h.stock.toString() === stock._id.toString()
  );

  if (type === 'buy') {
    if (user.cash < total) {
      return res.status(400).json({
        message: `Insufficient funds. You need $${total.toLocaleString()} but have $${user.cash.toLocaleString()}.`,
      });
    }

    user.cash = +(user.cash - total).toFixed(2);
    if (holding) {
      const newShares = holding.shares + quantity;
      holding.avgPrice = +((holding.avgPrice * holding.shares + total) / newShares).toFixed(2);
      holding.shares = newShares;
    } else {
      portfolio.holdings.push({ stock: stock._id, shares: quantity, avgPrice: price });
    }
  } else {
    // sell
    if (!holding || holding.shares < quantity) {
      return res.status(400).json({
        message: `You only own ${holding ? holding.shares : 0} shares of ${stock.symbol}`,
      });
    }
    user.cash = +(user.cash + total).toFixed(2);
    holding.shares -= quantity;
    if (holding.shares === 0) {
      portfolio.holdings = portfolio.holdings.filter(
        (h) => h.stock.toString() !== stock._id.toString()
      );
    }
  }

  await user.save();
  await portfolio.save();
  await Transaction.create({
    user: user._id,
    stock: stock._id,
    type,
    shares: quantity,
    price,
    total,
  });

  const updatedPortfolio = await Portfolio.findOne({ user: user._id }).populate({
    path: 'holdings.stock',
    select: 'symbol name price change changePercent sector',
  });

  return res.status(201).json({
    message: type === 'buy' ? 'Purchase successful' : 'Sale successful',
    transaction: { type, shares: quantity, price, total, symbol: stock.symbol, name: stock.name },
    cash: user.cash,
    portfolio: updatedPortfolio,
  });
};

/**
 * @route   POST /api/transactions/buy
 * @desc    Buy shares with virtual cash
 * @access  Private
 */
const buyStock = asyncHandler(async (req, res) => {
  await executeTrade(req, res, 'buy');
});

/**
 * @route   POST /api/transactions/sell
 * @desc    Sell shares from the portfolio
 * @access  Private
 */
const sellStock = asyncHandler(async (req, res) => {
  await executeTrade(req, res, 'sell');
});

/**
 * @route   GET /api/transactions
 * @desc    Transaction history for the logged-in user
 * @access  Private
 */
const getTransactions = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const [transactions, total] = await Promise.all([
    Transaction.find({ user: req.user._id })
      .populate('stock', 'symbol name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Transaction.countDocuments({ user: req.user._id }),
  ]);

  res.json({ transactions, total, page, pages: Math.ceil(total / limit) });
});

module.exports = { buyStock, sellStock, getTransactions };
