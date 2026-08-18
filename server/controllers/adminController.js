const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and search
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: regex }, { email: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    users,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get a single user's details with portfolio and transactions
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const portfolio = await Portfolio.findOne({ user: user._id }).populate({
    path: 'holdings.stock',
    select: 'symbol name price change changePercent sector',
  });

  const transactions = await Transaction.find({ user: user._id })
    .populate('stock', 'symbol name')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({ user, portfolio, transactions });
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Admin: update a user (role, cash, etc.)
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { name, email, role, cash, contact } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (contact !== undefined) user.contact = contact;
  if (role && ['user', 'admin'].includes(role)) user.role = role;
  if (cash !== undefined) user.cash = Number(cash);

  await user.save();
  res.json({ user: user.toSafeJSON() });
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Admin: soft-delete (deactivate) a user
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.role === 'admin') {
    return res.status(400).json({ message: 'Cannot deactivate admin accounts' });
  }
  user.isActive = false;
  await user.save();
  res.json({ message: 'User deactivated' });
});

/**
 * @route   GET /api/admin/stats
 * @desc    Dashboard stats for admin panel
 * @access  Private/Admin
 */
const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalStocks, totalTransactions, totalPortfolios] = await Promise.all([
    User.countDocuments({}),
    Stock.countDocuments({ isActive: true }),
    Transaction.countDocuments({}),
    Portfolio.countDocuments({}),
  ]);

  const recentUsers = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentTransactions = await Transaction.find({})
    .populate('stock', 'symbol name')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

  const cashAgg = await User.aggregate([
    { $group: { _id: null, totalCash: { $sum: '$cash' } } },
  ]);
  const totalVirtualCash = cashAgg[0]?.totalCash || 0;

  res.json({
    totalUsers,
    totalStocks,
    totalTransactions,
    totalPortfolios,
    totalVirtualCash,
    recentUsers,
    recentTransactions,
  });
});

/**
 * @route   GET /api/admin/stock-chart
 * @desc    Aggregated stock data for admin charts
 * @access  Private/Admin
 */
const getStockChart = asyncHandler(async (req, res) => {
  const { symbol = 'AAPL', period = '3M' } = req.query;

  const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
  if (!stock) {
    return res.status(404).json({ message: 'Stock not found' });
  }

  const now = new Date();
  let cutoff;
  switch (period) {
    case '1W': cutoff = new Date(now.getTime() - 7 * 86400000); break;
    case '1M': cutoff = new Date(now.getTime() - 30 * 86400000); break;
    case '3M': cutoff = new Date(now.getTime() - 90 * 86400000); break;
    case '6M': cutoff = new Date(now.getTime() - 180 * 86400000); break;
    case '1Y': cutoff = new Date(now.getTime() - 365 * 86400000); break;
    default: cutoff = new Date(now.getTime() - 90 * 86400000);
  }

  const history = stock.history.filter((h) => new Date(h.date) >= cutoff);

  res.json({
    symbol: stock.symbol,
    name: stock.name,
    currentPrice: stock.price,
    change: stock.change,
    changePercent: stock.changePercent,
    history: history.map((h) => ({ date: h.date, price: h.price, volume: h.volume || 0 })),
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getStats,
  getStockChart,
};
