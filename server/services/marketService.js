const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const cron = require('node-cron');
const Stock = require('../models/Stock');

let lastFetchTime = null;
let fetchInProgress = false;

/**
 * Check if US stock market is currently open (Mon-Fri, 9:30 AM - 4:00 PM ET).
 * In dev mode, always returns true.
 */
function isMarketOpen() {
  if (process.env.NODE_ENV !== 'production') return true;

  const now = new Date();
  const etOffset = -5 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const et = new Date(utc + etOffset * 60000);

  const day = et.getDay();
  if (day === 0 || day === 6) return false;

  const hours = et.getHours();
  const minutes = et.getMinutes();
  const time = hours * 60 + minutes;
  return time >= 570 && time < 960; // 9:30 = 570, 16:00 = 960
}

/**
 * Fetch live prices from Yahoo Finance for all active stocks.
 * Updates MongoDB with latest price, change, volume, etc.
 */
async function fetchLivePrices() {
  if (fetchInProgress) {
    console.log('[MarketService] Fetch already in progress, skipping.');
    return;
  }

  fetchInProgress = true;
  try {
    const stocks = await Stock.find({ isActive: true }).select('symbol');
    if (stocks.length === 0) {
      console.log('[MarketService] No active stocks found.');
      return;
    }

    const symbols = stocks.map((s) => s.symbol);
    const results = [];

    // Fetch in batches of 10 to avoid rate limiting
    for (let i = 0; i < symbols.length; i += 10) {
      const batch = symbols.slice(i, i + 10);
      try {
        const quotes = await Promise.allSettled(
          batch.map((symbol) =>
            yahooFinance.quote(symbol, {}, { validateSymbols: false })
          )
        );
        quotes.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          } else {
            console.warn(
              `[MarketService] Failed to fetch ${batch[idx]}:`,
              result.reason?.message || 'unknown error'
            );
          }
        });
      } catch (batchErr) {
        console.warn('[MarketService] Batch fetch error:', batchErr.message);
      }

      // Small delay between batches
      if (i + 10 < symbols.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    // Build bulk update operations instead of individual saves
    const now = new Date();
    const bulkOps = [];

    for (const quote of results) {
      try {
        const symbol = quote.symbol;
        const newPrice = quote.regularMarketPrice;
        if (!newPrice) continue;

        const prevClose =
          quote.regularMarketPreviousClose || quote.regularMarketPrice;
        const change = +(newPrice - prevClose).toFixed(4);
        const changePercent = prevClose
          ? +((change / prevClose) * 100).toFixed(2)
          : 0;

        const historyPoint = { price: +newPrice.toFixed(2), date: now };

        bulkOps.push({
          updateOne: {
            filter: { symbol, isActive: true },
            update: {
              $set: {
                price: +newPrice.toFixed(2),
                change: +change.toFixed(2),
                changePercent,
                open: quote.regularMarketOpen ? +quote.regularMarketOpen.toFixed(2) : undefined,
                high: quote.regularMarketDayHigh ? +quote.regularMarketDayHigh.toFixed(2) : undefined,
                low: quote.regularMarketDayLow ? +quote.regularMarketDayLow.toFixed(2) : undefined,
                previousClose: prevClose ? +prevClose.toFixed(2) : undefined,
                volume: quote.regularMarketVolume || undefined,
                marketCap: quote.marketCap || undefined,
                week52High: quote.fiftyTwoWeekHigh ? +quote.fiftyTwoWeekHigh.toFixed(2) : undefined,
                week52Low: quote.fiftyTwoWeekLow ? +quote.fiftyTwoWeekLow.toFixed(2) : undefined,
                lastFetchedAt: now,
              },
              $push: {
                history: {
                  $each: [historyPoint],
                  $slice: -500,
                },
              },
            },
          },
        });
      } catch (err) {
        console.warn(`[MarketService] Error preparing ${quote?.symbol}:`, err.message);
      }
    }

    let updated = 0;
    if (bulkOps.length > 0) {
      const result = await Stock.bulkWrite(bulkOps, { ordered: false });
      updated = result.modifiedCount;
    }

    lastFetchTime = new Date();
    console.log(
      `[MarketService] Updated ${updated}/${results.length} stocks at ${lastFetchTime.toISOString()}`
    );
  } catch (err) {
    console.error('[MarketService] Fatal error in fetchLivePrices:', err.message);
  } finally {
    fetchInProgress = false;
  }
}

/**
 * Fetch historical data from Yahoo Finance for a given symbol and range.
 * Returns array of { date, price, volume } objects.
 */
async function fetchHistoricalData(symbol, range = '3mo') {
  try {
    const period1 = getPeriodDate(range);
    const result = await yahooFinance.historical(symbol, {
      period1,
      period2: new Date(),
    });

    return result.map((item) => ({
      date: item.date,
      price: item.close,
      open: item.open,
      high: item.high,
      low: item.low,
      volume: item.volume,
    }));
  } catch (err) {
    console.warn(
      `[MarketService] Historical fetch failed for ${symbol}:`,
      err.message
    );
    return [];
  }
}

/**
 * Convert range string to a Date object.
 */
function getPeriodDate(range) {
  const now = new Date();
  switch (range) {
    case '1D':
      return new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    case '5D':
      return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    case '1W':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '1M':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '3M':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '6M':
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    case '1Y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case '5Y':
      return new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
    case 'ALL':
      return new Date('2020-01-01');
    default:
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Start the market data cron job.
 * Runs every 60 seconds. In dev mode, always runs.
 * In production, only runs during market hours (Mon-Fri 9:30-16:00 ET).
 */
function startMarketCron() {
  console.log('[MarketService] Starting market data cron job (every 60s)');

  // Run immediately on startup (non-blocking)
  setTimeout(() => fetchLivePrices(), 2000);

  // Schedule every 5 minutes to reduce load on Yahoo Finance and DB
  cron.schedule('*/5 * * * *', () => {
    if (isMarketOpen()) {
      fetchLivePrices();
    }
  });
}

module.exports = {
  fetchLivePrices,
  fetchHistoricalData,
  startMarketCron,
  getLastFetchTime: () => lastFetchTime,
};
