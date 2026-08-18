const Stock = require('../models/Stock');
const { asyncHandler } = require('../middleware/errorHandler');
const { fetchHistoricalData, getLastFetchTime } = require('../services/marketService');

/**
 * @route   GET /api/stocks?search=&sector=&sort=&page=&limit=
 * @desc    List stocks with search, sector filter, sorting and pagination
 * @access  Public
 */
const getStocks = asyncHandler(async (req, res) => {
  const { search, sector, sort, page = 1, limit = 30 } = req.query;

  const query = { isActive: true };

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ symbol: regex }, { name: regex }];
  }
  if (sector) {
    query.sector = sector;
  }

  const sortOptions = {
    symbol: { symbol: 1 },
    price: { price: 1 },
    priceDesc: { price: -1 },
    gainers: { changePercent: -1 },
    losers: { changePercent: 1 },
    volume: { volume: -1 },
    marketCap: { marketCap: -1 },
  };
  const sortBy = sortOptions[sort] || { symbol: 1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [stocks, total] = await Promise.all([
    Stock.find(query).sort(sortBy).skip(skip).limit(Number(limit)),
    Stock.countDocuments(query),
  ]);

  res.json({
    stocks,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

/**
 * @route   GET /api/stocks/:id
 * @desc    Get a single stock by id (or symbol)
 * @access  Public
 */
const getStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  const stock = isObjectId
    ? await Stock.findById(id)
    : await Stock.findOne({ symbol: id.toUpperCase() });

  if (!stock) {
    return res.status(404).json({ message: 'Stock not found' });
  }
  res.json({ stock });
});

/**
 * @route   GET /api/stocks/meta/sectors
 * @desc    Get distinct sectors for the filter dropdown
 * @access  Public
 */
const getSectors = asyncHandler(async (req, res) => {
  const sectors = await Stock.distinct('sector', { isActive: true });
  res.json({ sectors: sectors.filter(Boolean).sort() });
});

/**
 * @route   GET /api/stocks/meta/movers
 * @desc    Top gainers and losers of the day
 * @access  Public
 */
const getMovers = asyncHandler(async (req, res) => {
  const active = { isActive: true };
  const [gainers, losers, mostActive] = await Promise.all([
    Stock.find(active).sort({ changePercent: -1 }).limit(5),
    Stock.find(active).sort({ changePercent: 1 }).limit(5),
    Stock.find(active).sort({ volume: -1 }).limit(5),
  ]);
  res.json({ gainers, losers, mostActive });
});

/**
 * @route   POST /api/stocks
 * @desc    Admin: create a stock
 * @access  Private/Admin
 */
const createStock = asyncHandler(async (req, res) => {
  const { symbol, name, price, sector, industry, marketCap, volume } = req.body;

  if (!symbol || !name || price === undefined) {
    return res.status(400).json({ message: 'Symbol, name and price are required' });
  }

  const exists = await Stock.findOne({ symbol: symbol.toUpperCase() });
  if (exists) {
    return res.status(400).json({ message: `Stock ${symbol.toUpperCase()} already exists` });
  }

  const stock = await Stock.create({
    symbol: symbol.toUpperCase(),
    name,
    price: Number(price),
    open: Number(price),
    high: Number(price),
    low: Number(price),
    previousClose: Number(price),
    sector: sector || 'General',
    industry: industry || '',
    marketCap: Number(marketCap) || 0,
    volume: Number(volume) || 0,
    change: 0,
    changePercent: 0,
    history: [{ price: Number(price) }],
  });

  res.status(201).json({ stock });
});

/**
 * @route   PUT /api/stocks/:id
 * @desc    Admin: update a stock
 * @access  Private/Admin
 */
const updateStock = asyncHandler(async (req, res) => {
  const stock = await Stock.findById(req.params.id);
  if (!stock) {
    return res.status(404).json({ message: 'Stock not found' });
  }

  const allowed = [
    'name',
    'price',
    'open',
    'high',
    'low',
    'previousClose',
    'volume',
    'marketCap',
    'sector',
    'industry',
    'week52High',
    'week52Low',
    'isActive',
  ];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      stock[field] = req.body[field];
    }
  });

  // Keep change fields in sync with the new price
  if (req.body.price !== undefined) {
    const newPrice = Number(req.body.price);
    const prev = stock.previousClose || stock.price || newPrice;
    stock.change = +(newPrice - prev).toFixed(2);
    stock.changePercent = prev ? +(((newPrice - prev) / prev) * 100).toFixed(2) : 0;
    stock.history.push({ price: newPrice, date: Date.now() });
  }

  await stock.save();
  res.json({ stock });
});

/**
 * @route   DELETE /api/stocks/:id
 * @desc    Admin: soft-delete (deactivate) a stock
 * @access  Private/Admin
 */
const deleteStock = asyncHandler(async (req, res) => {
  const stock = await Stock.findById(req.params.id);
  if (!stock) {
    return res.status(404).json({ message: 'Stock not found' });
  }
  stock.isActive = false;
  await stock.save();
  res.json({ message: 'Stock deactivated' });
});

/**
 * @route   GET /api/stocks/:id/history?period=1M
 * @desc    Get price history for a stock with timeframe filtering + computed SMAs
 * @access  Public
 */
const getStockHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { period = '3M' } = req.query;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  const stock = isObjectId
    ? await Stock.findById(id)
    : await Stock.findOne({ symbol: id.toUpperCase() });

  if (!stock) {
    return res.status(404).json({ message: 'Stock not found' });
  }

  // Filter history by period
  const now = new Date();
  let cutoff;
  switch (period) {
    case '1D':
      cutoff = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      break;
    case '5D':
      cutoff = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      break;
    case '1W':
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1M':
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3M':
      cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '6M':
      cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case '1Y':
      cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'ALL':
      cutoff = new Date(0);
      break;
    default:
      cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }

  const history = stock.history.filter((h) => new Date(h.date) >= cutoff);

  // Compute Simple Moving Averages
  const prices = history.map((h) => h.price);
  const sma20 = computeSMA(prices, 20);
  const sma50 = computeSMA(prices, 50);

  // Compute volume data from history if available
  const volumes = history.map((h) => h.volume || 0);

  res.json({
    symbol: stock.symbol,
    name: stock.name,
    currentPrice: stock.price,
    change: stock.change,
    changePercent: stock.changePercent,
    period,
    history: history.map((h, i) => ({
      date: h.date,
      price: h.price,
      volume: h.volume || 0,
      sma20: sma20[i],
      sma50: sma50[i],
    })),
    lastFetchedAt: stock.lastFetchedAt,
    serverTime: now,
  });
});

/**
 * Compute Simple Moving Average for a price array.
 * Returns array same length as input, with null for insufficient data points.
 */
function computeSMA(prices, window) {
  const result = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < window - 1) {
      result.push(null);
    } else {
      const slice = prices.slice(i - window + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / window;
      result.push(+avg.toFixed(2));
    }
  }
  return result;
}

/**
 * @route   GET /api/stocks/live
 * @desc    Get batch live prices for all active stocks
 * @access  Public
 */
const getLiveStocks = asyncHandler(async (req, res) => {
  const stocks = await Stock.find({ isActive: true })
    .select('symbol name price change changePercent volume marketCap sector lastFetchedAt')
    .sort({ symbol: 1 });

  res.json({
    stocks,
    lastUpdated: getLastFetchTime(),
    serverTime: new Date(),
  });
});

module.exports = {
  getStocks,
  getStock,
  getStockHistory,
  getLiveStocks,
  getSectors,
  getMovers,
  createStock,
  updateStock,
  deleteStock,
};
