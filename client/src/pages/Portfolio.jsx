import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPortfolio, fetchPerformance } from '../redux/slices/portfolioSlice';
import StatCard from '../components/StatCard';
import PriceChart from '../components/PriceChart';
import TradeModal from '../components/TradeModal';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function Portfolio() {
  const dispatch = useDispatch();
  const { holdings, cash, positionsValue, totalValue, totalGainLoss, totalReturnPercent, status } =
    useSelector((state) => state.portfolio);
  const performance = useSelector((state) => state.portfolio.performance);
  const [sellStock, setSellStock] = useState(null);

  useEffect(() => {
    dispatch(fetchPortfolio());
    dispatch(fetchPerformance());
  }, [dispatch]);

  const holdingForTrade = sellStock
    ? {
        _id: sellStock.stockId,
        symbol: sellStock.symbol,
        name: sellStock.name,
        price: sellStock.currentPrice,
      }
    : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Portfolio</h1>
          <p>Your holdings, valuation and performance at a glance</p>
        </div>
        <Link to="/markets" className="btn btn-primary">+ Buy more</Link>
      </div>

      {status === 'loading' ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-4" style={{ marginBottom: 20 }}>
            <StatCard label="Total Value" value={fmt(totalValue)} sub="Cash + positions" />
            <StatCard label="Available Cash" value={fmt(cash)} />
            <StatCard label="Positions Value" value={fmt(positionsValue)} sub={`${holdings.length} open position(s)`} />
            <StatCard
              label="Unrealized G/L"
              value={`${totalGainLoss >= 0 ? '+' : ''}${fmt(totalGainLoss)}`}
              sub={`${totalReturnPercent >= 0 ? '+' : ''}${totalReturnPercent}%`}
              tone={totalGainLoss >= 0 ? 'green' : 'red'}
            />
          </div>

          <div className="chart-box" style={{ marginBottom: 20 }}>
            <h3>Account Value History</h3>
            {performance.length > 1 ? (
              <PriceChart
                labels={performance.map((p) => fmtDate(p.date))}
                data={performance.map((p) => p.value)}
                label="Account value"
                height={280}
              />
            ) : (
              <p className="empty-state" style={{ padding: 30 }}>
                Trade to start building your performance history.
              </p>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Holdings ({holdings.length})</h3>
            {holdings.length === 0 ? (
              <div className="empty-state">
                <div className="big">💼</div>
                <p>
                  Your portfolio is empty.{' '}
                  <Link to="/markets">Browse the markets</Link> and place your first trade.
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Shares</th>
                      <th>Avg Cost</th>
                      <th>Current Price</th>
                      <th>Market Value</th>
                      <th>Unrealized G/L</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h) => (
                      <tr key={h.stockId}>
                        <td>
                          <div className="stock-cell">
                            <span className="stock-symbol">{h.symbol}</span>
                            <span className="stock-name">{h.name}</span>
                          </div>
                        </td>
                        <td>{h.shares}</td>
                        <td>{fmt(h.avgPrice)}</td>
                        <td>{fmt(h.currentPrice)}</td>
                        <td>{fmt(h.marketValue)}</td>
                        <td className={h.gainLoss >= 0 ? 'pos' : 'neg'}>
                          {h.gainLoss >= 0 ? '+' : ''}
                          {fmt(h.gainLoss)} ({h.gainLossPercent >= 0 ? '+' : ''}
                          {h.gainLossPercent}%)
                        </td>
                        <td>
                          <button className="btn btn-red btn-sm" onClick={() => setSellStock(h)}>
                            Sell
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {holdingForTrade && (
        <TradeModal
          stock={holdingForTrade}
          mode="sell"
          onClose={() => setSellStock(null)}
        />
      )}
    </div>
  );
}
