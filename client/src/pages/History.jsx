import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../redux/slices/transactionSlice';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const fmtDateTime = (d) =>
  new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

export default function History() {
  const dispatch = useDispatch();
  const { transactions, status, total, page, pages } = useSelector((state) => state.transactions);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchTransactions({ page: currentPage, limit: 20 }));
  }, [dispatch, currentPage]);

  const buyTotal = transactions.filter((t) => t.type === 'buy').reduce((s, t) => s + t.total, 0);
  const sellTotal = transactions.filter((t) => t.type === 'sell').reduce((s, t) => s + t.total, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Trading History</h1>
          <p>{total} total transaction(s) · All buy and sell activities</p>
        </div>
        <Link to="/markets" className="btn btn-primary">+ New Trade</Link>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Trades</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Bought</div>
          <div className="stat-value pos">{fmt(buyTotal)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Sold</div>
          <div className="stat-value neg">{fmt(sellTotal)}</div>
        </div>
      </div>

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
                  <th>Date & Time</th>
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
                    <td>{fmtDateTime(t.createdAt)}</td>
                    <td>
                      <span className={`pill ${t.type === 'buy' ? 'pill-green' : 'pill-red'}`}>
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <Link to={`/markets/${t.stock?.symbol}`} className="stock-symbol">
                        {t.stock?.symbol}
                      </Link>
                      <span className="stock-name" style={{ marginLeft: 8 }}>{t.stock?.name}</span>
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
