const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/portfolio
 * @desc    Get the user's portfolio with live valuation summary
 * @access  Private
 */
const getPortfolio = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  let portfolio = await Portfolio.findOne({ user: user._id }).populate({
    path: 'holdings.stock',
    select: 'symbol name price change changePercent sector marketCap',
  });

  if (!portfolio) {
    portfolio = await Portfolio.create({ user: user._id, holdings: [] });
  }

  const holdings = portfolio.holdings
    .filter((h) => h.stock) // skip orphaned holdings (stock deleted)
    .map((h) => {
      const marketValue = h.shares * h.stock.price;
      const costBasis = h.shares * h.avgPrice;
      return {
        stockId: h.stock._id,
        symbol: h.stock.symbol,
        name: h.stock.name,
        sector: h.stock.sector,
        shares: h.shares,
        avgPrice: h.avgPrice,
        currentPrice: h.stock.price,
        marketValue: +marketValue.toFixed(2),
        costBasis: +costBasis.toFixed(2),
        gainLoss: +(marketValue - costBasis).toFixed(2),
        gainLossPercent: costBasis ? +(((marketValue - costBasis) / costBasis) * 100).toFixed(2) : 0,
      };
    });

  const positionsValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalValue = +(user.cash + positionsValue).toFixed(2);
  const totalGainLoss = holdings.reduce((sum, h) => sum + h.gainLoss, 0);
  const totalCostBasis = holdings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalReturnPercent = totalCostBasis
    ? +((totalGainLoss / totalCostBasis) * 100).toFixed(2)
    : 0;

  res.json({
    cash: user.cash,
    positionsValue: +positionsValue.toFixed(2),
    totalValue,
    totalGainLoss: +totalGainLoss.toFixed(2),
    totalReturnPercent,
    holdings,
  });
});

/**
 * @route   GET /api/portfolio/performance
 * @desc    Daily account value history for charts (from transactions)
 * @access  Private
 */
const getPerformance = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: 1 })
    .select('createdAt total type');

  const user = await User.findById(req.user._id);
  const initialCash = process.env.DEFAULT_CASH ? Number(process.env.DEFAULT_CASH) : 300000;

  // Build a day-by-day value series
  const byDay = new Map();
  let runningCash = initialCash;

  // Always start with initial cash on the day before the first transaction
  // This ensures the chart has at least 2 points (start + current)
  const firstTxDay = transactions.length > 0
    ? transactions[0].createdAt.toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const startDay = new Date(new Date(firstTxDay).getTime() - 86400000).toISOString().slice(0, 10);
  byDay.set(startDay, { date: startDay, cash: initialCash, invested: 0 });

  transactions.forEach((t) => {
    const day = t.createdAt.toISOString().slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, { date: day, cash: runningCash, invested: 0 });
    const entry = byDay.get(day);
    if (t.type === 'buy') {
      runningCash -= t.total;
      entry.invested += t.total;
    } else {
      runningCash += t.total;
      entry.invested -= t.total;
    }
  });

  const points = Array.from(byDay.values());
  const series = points.map((p) => ({
    date: p.date,
    value: +(p.cash + p.invested).toFixed(2),
  }));

  // Always include today's current value as the last point
  const today = new Date().toISOString().slice(0, 10);
  const positionsValue = 0; // simplified — portfolio endpoint handles real valuation
  const todayValue = +(user.cash + positionsValue).toFixed(2);
  if (series.length === 0 || series[series.length - 1].date !== today) {
    series.push({ date: today, value: todayValue });
  } else {
    // Update today's point with current cash
    series[series.length - 1].value = todayValue;
  }

  res.json({ series });
});

module.exports = { getPortfolio, getPerformance };
