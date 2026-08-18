import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../redux/slices/transactionSlice';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const fmtDate = (d) =>
  new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });

export default function AllOrders() {
  const dispatch = useDispatch();
  const { transactions, status, total, page, pages } = useSelector((state) => state.transactions);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchTransactions({ page: currentPage, limit: 20 }));
  }, [dispatch, currentPage]);

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.type === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>All Orders</h1>
          <p>Complete list of your buy and sell orders</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'buy', 'sell'].map((f) => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setFilter(f); setCurrentPage(1); }}
            >
              {f === 'all' ? 'All' : f === 'buy' ? 'Buys' : 'Sells'}
            </button>
          ))}
        </div>
      </div>

      {status === 'loading' ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="big">📋</div>
          <p>No {filter !== 'all' ? filter : ''} orders found. <Link to="/markets">Place a trade!</Link></p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order Type</th>
                  <th>Stock</th>
                  <th>Shares</th>
                  <th>Price per Share</th>
                  <th>Order Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
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
