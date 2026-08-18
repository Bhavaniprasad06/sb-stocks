import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/client';
import LivePriceChart from '../components/LivePriceChart';
import TimeframeSelector from '../components/TimeframeSelector';
import LivePrice from '../components/LivePrice';
import TradeModal from '../components/TradeModal';
import Spinner from '../components/Spinner';
import {
  fetchStockHistory,
  clearStockHistory,
} from '../redux/slices/stockSlice';
import {
  addToWatchlist,
  removeFromWatchlist,
  fetchWatchlist,
} from '../redux/slices/watchlistSlice';

const fmtCurrency = (n) =>
  Number(n || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });

const fmtNumber = (n) =>
  Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

const fmtCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v.toLocaleString()}`;
};

export default function StockDetail() {
  const { symbol } = useParams();
  const dispatch = useDispatch();
  const watchlist = useSelector((state) => state.watchlist.stocks);
  const { stockHistory, stockHistoryStatus } = useSelector((state) => state.stocks);

  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tradeMode, setTradeMode] = useState(null);
  const [period, setPeriod] = useState('3M');

  const loadStock = useCallback(async () => {
    try {
      const { data } = await api.get(`/stocks/${symbol}`);
      setStock(data.stock);
    } catch (err) {
      setError(err.message || 'Failed to load stock');
    }
  }, [symbol]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    loadStock().then(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [loadStock]);

  useEffect(() => {
    dispatch(fetchStockHistory({ symbol, period }));
    return () => dispatch(clearStockHistory());
  }, [symbol, period, dispatch]);

  useEffect(() => {
    dispatch(fetchWatchlist());
  }, [dispatch]);

  // Live polling every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadStock();
      dispatch(fetchStockHistory({ symbol, period }));
    }, 15000);
    return () => clearInterval(interval);
  }, [symbol, period, dispatch, loadStock]);

  if (loading) return <Spinner />;

  if (error || !stock) {
    return (
      <div className="empty-state">
        <div className="big">🔍</div>
        <p>{error || 'Stock not found'}</p>
        <Link to="/markets" className="btn btn-outline" style={{ marginTop: 16 }}>
          ← Back to Markets
        </Link>
      </div>
    );
  }

  const up = stock.change >= 0;
  const isWatched = watchlist.some((s) => s._id === stock._id);

  const toggleWatch = () => {
    if (isWatched) {
      dispatch(removeFromWatchlist(stock._id));
    } else {
      dispatch(addToWatchlist(stock._id));
    }
  };

  const history = stockHistory?.history || stock.history || [];
  const stats = [
    { label: 'Open', value: fmtCurrency(stock.open) },
    { label: 'High', value: fmtCurrency(stock.high) },
    { label: 'Low', value: fmtCurrency(stock.low) },
    { label: 'Prev Close', value: fmtCurrency(stock.previousClose) },
    { label: 'Volume', value: fmtNumber(stock.volume) },
    { label: 'Market Cap', value: fmtCompact(stock.marketCap) },
    { label: '52W High', value: fmtCurrency(stock.week52High) },
    { label: '52W Low', value: fmtCurrency(stock.week52Low) },
  ];

  const tradeStock = { _id: stock._id, symbol: stock.symbol, name: stock.name, price: stock.price };

  // Compute indicators from latest data
  const latestSMA20 = history.length > 0 ? history[history.length - 1].sma20 : null;
  const latestSMA50 = history.length > 0 ? history[history.length - 1].sma50 : null;
  const priceVsSMA20 = latestSMA20 ? ((stock.price - latestSMA20) / latestSMA20 * 100).toFixed(2) : null;
  const priceVsSMA50 = latestSMA50 ? ((stock.price - latestSMA50) / latestSMA50 * 100).toFixed(2) : null;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to="/markets" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ← Back to Markets
        </Link>
      </div>

      {/* Header */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.8rem' }}>{stock.symbol}</h1>
              <span className="tag">{stock.sector}</span>
              {stock.industry && <span className="tag">{stock.industry}</span>}
              {stockHistoryStatus === 'succeeded' && (
                <span className="tag live-tag">LIVE</span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{stock.name}</p>
            <div style={{ marginTop: 12 }}>
              <LivePrice price={stock.price} change={stock.change} changePercent={stock.changePercent} size="lg" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className={`btn ${isWatched ? 'btn-outline' : 'btn-primary'}`} onClick={toggleWatch}>
              {isWatched ? '★ Watched' : '☆ Watchlist'}
            </button>
            <button className="btn btn-green" onClick={() => setTradeMode('buy')}>Buy</button>
            <button className="btn btn-red" onClick={() => setTradeMode('sell')}>Sell</button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-box" style={{ marginBottom: 16 }}>
        <div className="chart-toolbar">
          <TimeframeSelector value={period} onChange={setPeriod} />
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot" style={{ background: '#00ff88' }} /> Price</span>
            {latestSMA20 && <span className="legend-item"><span className="legend-dot" style={{ background: '#4f8cff' }} /> SMA 20</span>}
            {latestSMA50 && <span className="legend-item"><span className="legend-dot" style={{ background: '#ff9500' }} /> SMA 50</span>}
          </div>
        </div>
        {stockHistoryStatus === 'loading' ? (
          <Spinner />
        ) : history.length > 1 ? (
          <LivePriceChart history={history} period={period} height={400} />
        ) : (
          <p className="empty-state" style={{ padding: 40 }}>No price history available yet.</p>
        )}
      </div>

      {/* Indicators + Stats */}
      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Technical Indicators</h3>
          <div className="indicator-grid">
            <div className="indicator-row">
              <span className="indicator-label">SMA 20</span>
              <span className="indicator-value">{latestSMA20 ? fmtCurrency(latestSMA20) : '—'}</span>
              {priceVsSMA20 && (
                <span className={`indicator-badge ${Number(priceVsSMA20) >= 0 ? 'pos' : 'neg'}`}>
                  {Number(priceVsSMA20) >= 0 ? '+' : ''}{priceVsSMA20}% vs price
                </span>
              )}
            </div>
            <div className="indicator-row">
              <span className="indicator-label">SMA 50</span>
              <span className="indicator-value">{latestSMA50 ? fmtCurrency(latestSMA50) : '—'}</span>
              {priceVsSMA50 && (
                <span className={`indicator-badge ${Number(priceVsSMA50) >= 0 ? 'pos' : 'neg'}`}>
                  {Number(priceVsSMA50) >= 0 ? '+' : ''}{priceVsSMA50}% vs price
                </span>
              )}
            </div>
            <div className="indicator-row">
              <span className="indicator-label">Price vs SMA 20</span>
              <span className={`indicator-value ${priceVsSMA20 >= 0 ? 'pos' : 'neg'}`}>
                {priceVsSMA20 ? `${priceVsSMA20 >= 0 ? 'Above' : 'Below'}` : '—'}
              </span>
            </div>
            <div className="indicator-row">
              <span className="indicator-label">Price vs SMA 50</span>
              <span className={`indicator-value ${priceVsSMA50 >= 0 ? 'pos' : 'neg'}`}>
                {priceVsSMA50 ? `${priceVsSMA50 >= 0 ? 'Above' : 'Below'}` : '—'}
              </span>
            </div>
            <div className="indicator-row">
              <span className="indicator-label">Day High</span>
              <span className="indicator-value">{fmtCurrency(stock.high)}</span>
            </div>
            <div className="indicator-row">
              <span className="indicator-label">Day Low</span>
              <span className="indicator-value">{fmtCurrency(stock.low)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Key Statistics</h3>
          <div className="stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="stat-row">
                <span className="stat-row-label">{s.label}</span>
                <span className="stat-row-value">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tradeMode && (
        <TradeModal stock={tradeStock} mode={tradeMode} onClose={() => setTradeMode(null)} />
      )}
    </div>
  );
}
