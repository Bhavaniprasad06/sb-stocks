require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), override: true });
const connectDB = require('../config/db');
const Stock = require('../models/Stock');

/**
 * Base data for popular US stocks. Prices are illustrative (not live) so the
 * app works offline; swap in a real market-data API later if desired.
 */
const STOCK_DATA = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 214.29, sector: 'Technology', industry: 'Consumer Electronics', marketCap: 3260000000000, volume: 52400000 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 453.76, sector: 'Technology', industry: 'Software—Infrastructure', marketCap: 3370000000000, volume: 19800000 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 176.22, sector: 'Communication Services', industry: 'Internet Content & Information', marketCap: 2170000000000, volume: 26300000 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 186.41, sector: 'Consumer Cyclical', industry: 'Internet Retail', marketCap: 1940000000000, volume: 41200000 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 128.61, sector: 'Technology', industry: 'Semiconductors', marketCap: 3160000000000, volume: 246000000 },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 512.38, sector: 'Communication Services', industry: 'Internet Content & Information', marketCap: 1300000000000, volume: 13200000 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.5, sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', marketCap: 792000000000, volume: 101000000 },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', price: 452.11, sector: 'Financial Services', industry: 'Insurance—Diversified', marketCap: 972000000000, volume: 3200000 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 207.91, sector: 'Financial Services', industry: 'Banks—Diversified', marketCap: 594000000000, volume: 8900000 },
  { symbol: 'V', name: 'Visa Inc.', price: 263.41, sector: 'Financial Services', industry: 'Credit Services', marketCap: 524000000000, volume: 5400000 },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', price: 487.82, sector: 'Healthcare', industry: 'Healthcare Plans', marketCap: 451000000000, volume: 3300000 },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', price: 115.57, sector: 'Energy', industry: 'Oil & Gas Integrated', marketCap: 512000000000, volume: 13900000 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 158.74, sector: 'Healthcare', industry: 'Drug Manufacturers—General', marketCap: 382000000000, volume: 6800000 },
  { symbol: 'WMT', name: 'Walmart Inc.', price: 70.93, sector: 'Consumer Defensive', industry: 'Discount Stores', marketCap: 571000000000, volume: 18800000 },
  { symbol: 'PG', name: 'Procter & Gamble Company', price: 168.25, sector: 'Consumer Defensive', industry: 'Household & Personal Products', marketCap: 396000000000, volume: 5400000 },
  { symbol: 'MA', name: 'Mastercard Incorporated', price: 479.3, sector: 'Financial Services', industry: 'Credit Services', marketCap: 441000000000, volume: 2100000 },
  { symbol: 'HD', name: 'Home Depot Inc.', price: 361.82, sector: 'Consumer Cyclical', industry: 'Home Improvement Retail', marketCap: 359000000000, volume: 3400000 },
  { symbol: 'ORCL', name: 'Oracle Corporation', price: 142.27, sector: 'Technology', industry: 'Software—Infrastructure', marketCap: 397000000000, volume: 8700000 },
  { symbol: 'KO', name: 'Coca-Cola Company', price: 64.88, sector: 'Consumer Defensive', industry: 'Beverages—Non-Alcoholic', marketCap: 279000000000, volume: 12200000 },
  { symbol: 'PEP', name: 'PepsiCo Inc.', price: 177.94, sector: 'Consumer Defensive', industry: 'Beverages—Non-Alcoholic', marketCap: 244000000000, volume: 5000000 },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', price: 877.3, sector: 'Consumer Defensive', industry: 'Discount Stores', marketCap: 389000000000, volume: 1900000 },
  { symbol: 'CRM', name: 'Salesforce Inc.', price: 254.31, sector: 'Technology', industry: 'Software—Application', marketCap: 245000000000, volume: 5200000 },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', price: 161.34, sector: 'Technology', industry: 'Semiconductors', marketCap: 261000000000, volume: 53200000 },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 671.44, sector: 'Communication Services', industry: 'Entertainment', marketCap: 288000000000, volume: 3000000 },
  { symbol: 'DIS', name: 'Walt Disney Company', price: 95.62, sector: 'Communication Services', industry: 'Entertainment', marketCap: 173000000000, volume: 9400000 },
  { symbol: 'INTC', name: 'Intel Corporation', price: 31.16, sector: 'Technology', industry: 'Semiconductors', marketCap: 133000000000, volume: 45100000 },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', price: 48.56, sector: 'Technology', industry: 'Communication Equipment', marketCap: 194000000000, volume: 17300000 },
  { symbol: 'BA', name: 'Boeing Company', price: 172.37, sector: 'Industrials', industry: 'Aerospace & Defense', marketCap: 129000000000, volume: 7800000 },
  { symbol: 'GM', name: 'General Motors Company', price: 47.14, sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', marketCap: 52400000000, volume: 11400000 },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', price: 69.85, sector: 'Technology', industry: 'Software—Application', marketCap: 146000000000, volume: 15900000 },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', price: 67.33, sector: 'Financial Services', industry: 'Credit Services', marketCap: 70900000000, volume: 9300000 },
  { symbol: 'SQQQ', name: 'ProShares UltraPro Short QQQ', price: 9.87, sector: 'Financial Services', industry: 'Exchange Traded Fund', marketCap: 3100000000, volume: 182000000 },
  { symbol: 'PLTR', name: 'Palantir Technologies Inc.', price: 28.44, sector: 'Technology', industry: 'Software—Infrastructure', marketCap: 64400000000, volume: 69300000 },
  { symbol: 'AAL', name: 'American Airlines Group Inc.', price: 10.62, sector: 'Industrials', industry: 'Airlines', marketCap: 6990000000, volume: 31000000 },
  { symbol: 'F', name: 'Ford Motor Company', price: 13.09, sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', marketCap: 52200000000, volume: 46600000 },
  { symbol: 'T', name: 'AT&T Inc.', price: 19.29, sector: 'Communication Services', industry: 'Telecom Services', marketCap: 138000000000, volume: 39700000 },
  { symbol: 'BAC', name: 'Bank of America Corporation', price: 39.53, sector: 'Financial Services', industry: 'Banks—Diversified', marketCap: 303000000000, volume: 35600000 },
  { symbol: 'NIO', name: 'NIO Inc.', price: 4.93, sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', marketCap: 10300000000, volume: 45600000 },
  { symbol: 'SHOP', name: 'Shopify Inc.', price: 66.71, sector: 'Technology', industry: 'Software—Application', marketCap: 86100000000, volume: 7900000 },
  { symbol: 'SQ', name: 'Block Inc.', price: 61.25, sector: 'Technology', industry: 'Software—Infrastructure', marketCap: 37700000000, volume: 9800000 },
];

/**
 * Generate ~90 days of plausible daily price history ending at the given
 * price, plus daily volume. Uses a seeded random walk so re-running the seed
 * produces the same data.
 */
function generateHistory(basePrice, volatility = 0.02, days = 90, seed = 42) {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };

  const points = [];
  let price = basePrice;
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    // Skip weekends to mimic trading days
    const day = date.getDay();
    if (day === 0 || day === 6) continue;

    const drift = (rand() - 0.5) * 2 * volatility;
    price = price * (1 + drift);
    if (price < 1) price = 1;
    points.push({ date, price: +price.toFixed(2) });
  }

  // Ensure the final point is the current price
  points[points.length - 1].price = basePrice;
  return points;
}

async function seed() {
  try {
    await connectDB();
    console.log('Seeding stocks...');

    await Stock.deleteMany({});
    console.log('Cleared existing stocks.');

    const stocks = STOCK_DATA.map((data) => {
      const history = generateHistory(data.price);
      const prev = history[history.length - 2]?.price ?? data.price;
      const change = +(data.price - prev).toFixed(2);
      const changePercent = prev ? +((change / prev) * 100).toFixed(2) : 0;

      const highs = history.map((h) => h.price);
      const lows = history.map((h) => h.price);

      return {
        ...data,
        open: +(prev * (1 + (Math.random() - 0.5) * 0.004)).toFixed(2),
        high: +(Math.max(...highs) * 1.005).toFixed(2),
        low: +(Math.min(...lows) * 0.995).toFixed(2),
        previousClose: prev,
        change,
        changePercent,
        week52High: +(Math.max(...highs) * 1.02).toFixed(2),
        week52Low: +(Math.min(...lows) * 0.98).toFixed(2),
        history,
      };
    });

    await Stock.insertMany(stocks);
    console.log(`Seeded ${stocks.length} stocks successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
