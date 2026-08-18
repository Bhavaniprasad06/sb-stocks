import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockHistory } from '../redux/slices/stockSlice';
import LivePriceChart from './LivePriceChart';
import Spinner from './Spinner';
import { Link } from 'react-router-dom';

const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'GOOGL', name: 'Google' },
  { symbol: 'META', name: 'Meta' },
];

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });

export default function MarketOverview() {
  const dispatch = useDispatch();
  const { liveStocks, stockHistory, stockHistoryStatus } = useSelector(
    (state) => state.stocks
  );
  const [selected, setSelected] = useState('AAPL');
  const [period, setPeriod] = useState('1M');

  // Fetch history for selected stock
  const loadHistory = useCallback(() => {
    dispatch(fetchStockHistory({ symbol: selected, period }));
  }, [dispatch, selected, period]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadHistory, 30000);
    return () => clearInterval(interval);
  }, [loadHistory]);

  // Get live price for selected stock
  const liveStock = liveStocks.find((s) => s.symbol === selected);
  const currentPrice = liveStock?.price || stockHistory?.currentPrice || 0;
  const change = liveStock?.change || stockHistory?.change || 0;
  const changePercent = liveStock?.changePercent || stockHistory?.changePercent || 0;
  const isUp = change >= 0;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="market-overview-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3 style={{ margin: 0 }}>Market Overview</h3>
          <span className="tag live-tag">LIVE</span>
        </div>

        {/* Period selector */}
        <div className="period-tabs">
          {['1D', '1W', '1M', '3M', '6M', '1Y'].map((p) => (
            <button
              key={p}
              className={`period-tab ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stock tabs */}
      <div className="stock-tabs">
        {POPULAR_STOCKS.map((s) => {
          const live = liveStocks.find((ls) => ls.symbol === s.symbol);
          const cp = live?.price || 0;
          const ch = live?.changePercent || 0;
          return (
            <button
              key={s.symbol}
              className={`stock-tab ${selected === s.symbol ? 'active' : ''}`}
              onClick={() => setSelected(s.symbol)}
            >
              <span className="stock-tab-symbol">{s.symbol}</span>
              {cp > 0 && (
                <span className="stock-tab-price">
                  {fmt(cp)}
                  <span className={ch >= 0 ? 'pos' : 'neg'} style={{ fontSize: '0.7rem', marginLeft: 4 }}>
                    {ch >= 0 ? '+' : ''}{ch}%
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Current price header */}
      <div className="market-price-header">
        <div>
          <Link to={`/markets/${selected}`} className="market-price-symbol">
            {selected}
          </Link>
          <span className="market-price-name">
            {stockHistory?.name || POPULAR_STOCKS.find((s) => s.symbol === selected)?.name}
          </span>
        </div>
        <div className="market-price-right">
          <span className="market-current-price">{fmt(currentPrice)}</span>
          <span className={`market-price-change ${isUp ? 'pos' : 'neg'}`}>
            {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{fmt(change)} ({isUp ? '+' : ''}{changePercent}%)
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '0 4px' }}>
        {stockHistoryStatus === 'loading' ? (
          <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner />
          </div>
        ) : stockHistory?.history?.length > 0 ? (
          <LivePriceChart
            history={stockHistory.history}
            period={period}
            height={320}
            showVolume={false}
            showSMA={period !== '1D'}
          />
        ) : (
          <div className="empty-state" style={{ padding: 60 }}>
            <p>No chart data available for {selected}</p>
          </div>
        )}
      </div>
    </div>
  );
}
