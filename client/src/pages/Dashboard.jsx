import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPortfolio, fetchPerformance } from '../redux/slices/portfolioSlice';
import { fetchTransactions } from '../redux/slices/transactionSlice';
import { fetchWatchlist } from '../redux/slices/watchlistSlice';
import { fetchMovers, fetchLiveStocks } from '../redux/slices/stockSlice';
import StatCard from '../components/StatCard';
import PriceChart from '../components/PriceChart';
import LivePriceChart from '../components/LivePriceChart';
import MarketOverview from '../components/MarketOverview';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const fmtDateTime = (d) =>
  new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function Dashboard() {
  const dispatch = useDispatch();
  const portfolio = useSelector((state) => state.portfolio);
  const { transactions, status: txStatus } = useSelector((state) => state.transactions);
  const { movers, moversStatus, liveStocks } = useSelector((state) => state.stocks);
  const { user } = useSelector((state) => state.auth);
  const [topMovers, setTopMovers] = useState([]);

  useEffect(() => {
    dispatch(fetchPortfolio());
    dispatch(fetchPerformance());
    dispatch(fetchTransactions({ limit: 8 }));
    dispatch(fetchWatchlist());
    dispatch(fetchMovers());
    dispatch(fetchLiveStocks());
  }, [dispatch]);

  // Live polling for movers
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchLiveStocks());
      dispatch(fetchMovers());
    }, 15000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const chartLabels = portfolio.performance.map((p) => fmtDate(p.date));
  const chartData = portfolio.performance.map((p) => p.value);

  // Merge live prices into movers display
  const liveMap = {};
  liveStocks.forEach((s) => { liveMap[s.symbol] = s; });

  const enrichMovers = (arr) =>
    arr.map((m) => {
      const live = liveMap[m.symbol];
      return live ? { ...m, price: live.price, change: live.change, changePercent: live.changePercent } : m;
    });

  const enrichedGainers = enrichMovers(movers.gainers || []);
  const enrichedLosers = enrichMovers(movers.losers || []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.name.split(' ')[0]}</h1>
          <p>Here's what your paper portfolio is doing today</p>
        </div>
        <Link to="/markets" className="btn btn-primary">
          + Trade Stocks
        </Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Account Value" value={fmt(portfolio.totalValue)} sub="Cash + positions" />
        <StatCard label="Available Cash" value={fmt(portfolio.cash)} sub="Ready to invest" />
        <StatCard label="Positions Value" value={fmt(portfolio.positionsValue)} sub={`${portfolio.holdings.length} holding(s)`} />
        <StatCard
          label="Total Gain / Loss"
          value={`${portfolio.totalGainLoss >= 0 ? '+' : ''}${fmt(portfolio.totalGainLoss)}`}
          sub={`${portfolio.totalReturnPercent >= 0 ? '+' : ''}${portfolio.totalReturnPercent}% return`}
          tone={portfolio.totalGainLoss >= 0 ? 'green' : 'red'}
        />
      </div>

      <MarketOverview />

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="chart-box">
          <h3>Account Performance</h3>
          {chartData.length >= 1 ? (
            <PriceChart labels={chartLabels} data={chartData} label="Account value" height={300} />
          ) : (
            <p className="empty-state" style={{ padding: 40 }}>
              No activity yet — make your first trade to see your performance curve.
            </p>
          )}
        </div>

        <div className="chart-box">
          <div className="chart-toolbar" style={{ marginBottom: 14 }}>
            <h3>Today's Movers</h3>
            <span className="tag live-tag">LIVE</span>
          </div>
          {moversStatus === 'loading' ? (
            <Spinner />
          ) : (
            <div className="movers-grid">
              <div>
                <h4 className="pos" style={{ marginBottom: 8, fontSize: '0.85rem' }}>▲ Top Gainers</h4>
                <table className="data-table compact-table">
                  <thead>
                    <tr><th>Symbol</th><th>Price</th><th>% Change</th></tr>
                  </thead>
                  <tbody>
                    {enrichedGainers.map((s) => (
                      <tr key={s._id}>
                        <td><Link to={`/markets/${s.symbol}`} className="stock-symbol">{s.symbol}</Link></td>
                        <td>{fmt(s.price)}</td>
                        <td className={s.changePercent >= 0 ? 'pos' : 'neg'}>
                          {s.changePercent >= 0 ? '+' : ''}{s.changePercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h4 className="neg" style={{ marginBottom: 8, fontSize: '0.85rem' }}>▼ Top Losers</h4>
                <table className="data-table compact-table">
                  <thead>
                    <tr><th>Symbol</th><th>Price</th><th>% Change</th></tr>
                  </thead>
                  <tbody>
                    {enrichedLosers.map((s) => (
                      <tr key={s._id}>
                        <td><Link to={`/markets/${s.symbol}`} className="stock-symbol">{s.symbol}</Link></td>
                        <td>{fmt(s.price)}</td>
                        <td className={s.changePercent >= 0 ? 'pos' : 'neg'}>
                          {s.changePercent >= 0 ? '+' : ''}{s.changePercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3>Your Positions</h3>
            <Link to="/portfolio" className="btn btn-outline btn-sm">View all →</Link>
          </div>
          {portfolio.holdings.length === 0 ? (
            <div className="empty-state">
              <div className="big">📭</div>
              <p>No positions yet. Head to Markets to buy your first stock!</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Shares</th>
                    <th>Avg Price</th>
                    <th>Current</th>
                    <th>G/L</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.slice(0, 6).map((h) => {
                    const live = liveMap[h.symbol];
                    const currentPrice = live ? live.price : h.currentPrice;
                    const gainLoss = live
                      ? +((live.price - h.avgPrice) * h.shares).toFixed(2)
                      : h.gainLoss;
                    return (
                      <tr key={h.stockId}>
                        <td>
                          <Link to={`/markets/${h.symbol}`} className="stock-symbol">{h.symbol}</Link>
                        </td>
                        <td>{h.shares}</td>
                        <td>{fmt(h.avgPrice)}</td>
                        <td>{fmt(currentPrice)}</td>
                        <td className={gainLoss >= 0 ? 'pos' : 'neg'}>
                          {gainLoss >= 0 ? '+' : ''}{fmt(gainLoss)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3>Recent Activity</h3>
            <span className="tag">Last {transactions.length} trades</span>
          </div>
          {txStatus === 'loading' ? (
            <Spinner />
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="big">🧾</div>
              <p>No trades yet — your transaction history will appear here.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Symbol</th>
                    <th>Shares</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t._id}>
                      <td>{fmtDateTime(t.createdAt)}</td>
                      <td>
                        <span className={`pill ${t.type === 'buy' ? 'pill-green' : 'pill-red'}`}>
                          {t.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="stock-symbol">{t.stock?.symbol}</td>
                      <td>{t.shares}</td>
                      <td>{fmt(t.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
