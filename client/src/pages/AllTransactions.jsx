import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../redux/slices/transactionSlice';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import PriceChart from '../components/PriceChart';

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const fmtDate = (d) =>
  new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });

export default function AllTransactions() {
  const dispatch = useDispatch();
  const { transactions, status, total, page, pages } = useSelector((state) => state.transactions);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchTransactions({ page: currentPage, limit: 20 }));
  }, [dispatch, currentPage]);

  // Compute summary stats
  const buys = transactions.filter((t) => t.type === 'buy');
  const sells = transactions.filter((t) => t.type === 'sell');
  const totalSpent = buys.reduce((s, t) => s + t.total, 0);
  const totalReceived = sells.reduce((s, t) => s + t.total, 0);

  // Group by stock for chart data
  const byStock = {};
  transactions.forEach((t) => {
    const sym = t.stock?.symbol || 'Unknown';
    if (!byStock[sym]) byStock[sym] = { bought: 0, sold: 0 };
    if (t.type === 'buy') byStock[sym].bought += t.total;
    else byStock[sym].sold += t.total;
  });
  const chartLabels = Object.keys(byStock);
  const chartBought = chartLabels.map((s) => +byStock[s].bought.toFixed(2));
  const chartSold = chartLabels.map((s) => +byStock[s].sold.toFixed(2));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>All Transactions</h1>
          <p>Complete transaction history and analytics</p>
        </div>
        <Link to="/markets" className="btn btn-primary">+ New Trade</Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Total Transactions" value={total} />
        <StatCard label="Total Bought" value={fmt(totalSpent)} tone="red" />
        <StatCard label="Total Sold" value={fmt(totalReceived)} tone="green" />
        <StatCard
          label="Net Flow"
          value={`${totalReceived - totalSpent >= 0 ? '+' : ''}${fmt(totalReceived - totalSpent)}`}
          tone={totalReceived - totalSpent >= 0 ? 'green' : 'red'}
        />
      </div>

      {chartLabels.length > 0 && (
        <div className="chart-box" style={{ marginBottom: 20 }}>
          <h3>Transactions by Stock</h3>
          <PriceChart
            labels={chartLabels}
            data={chartBought}
            label="Bought"
            height={260}
          />
        </div>
      )}

      {status === 'loading' ? (
        <Spinner />
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <div className="big">🧾</div>
          <p>No transactions yet. <Link to="/markets">Start trading!</Link></p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Stock</th>
                  <th>Shares</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td>{fmtDate(t.createdAt)}</td>
                    <td>
                      <span className={`pill ${t.type === 'buy' ? 'pill-green' : 'pill-red'}`}>
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <Link to={`/markets/${t.stock?.symbol}`} className="stock-symbol">
                        {t.stock?.symbol}
                      </Link>
                    </td>
                    <td>{t.shares}</td>
                    <td>{fmt(t.price)}</td>
                    <td className={t.type === 'buy' ? 'neg' : 'pos'}>{fmt(t.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >← Prev</button>
              <span className="page-info">Page {currentPage} of {pages}</span>
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage >= pages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
