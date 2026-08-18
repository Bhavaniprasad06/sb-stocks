import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWatchlist, removeFromWatchlist } from '../redux/slices/watchlistSlice';

const fmt = (n, opts = {}) =>
  Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2, ...opts });

const fmtCurrency = (n) =>
  Number(n || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });

const fmtCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v.toLocaleString()}`;
};

export default function StockTable({ stocks, onTrade, showWatchlist = true, compact = false }) {
  const dispatch = useDispatch();
  const watchlist = useSelector((state) => state.watchlist.stocks);
  const { user } = useSelector((state) => state.auth);

  const isWatched = (id) => watchlist.some((s) => s._id === id);

  const toggleWatch = (e, stock) => {
    e.stopPropagation();
    if (isWatched(stock._id)) {
      dispatch(removeFromWatchlist(stock._id));
    } else {
      dispatch(addToWatchlist(stock._id));
    }
  };

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Price</th>
            <th>Change</th>
            <th>% Change</th>
            {!compact && <th>Volume</th>}
            {!compact && <th>Mkt Cap</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const up = stock.change >= 0;
            return (
              <tr key={stock._id}>
                <td>
                  <Link to={`/markets/${stock.symbol}`} className="stock-cell">
                    <span className="stock-symbol">{stock.symbol}</span>
                    <span className="stock-name">{stock.name}</span>
                  </Link>
                </td>
                <td className={up ? 'pos' : 'neg'}>{fmtCurrency(stock.price)}</td>
                <td className={up ? 'pos' : 'neg'}>
                  {up ? '+' : ''}
                  {fmt(stock.change)}
                </td>
                <td>
                  <span className={`pill ${up ? 'pill-green' : 'pill-red'}`}>
                    {up ? '+' : ''}
                    {fmt(stock.changePercent)}%
                  </span>
                </td>
                {!compact && <td>{fmt(stock.volume, { notation: 'compact' })}</td>}
                {!compact && <td>{fmtCompact(stock.marketCap)}</td>}
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {showWatchlist && user && (
                      <button
                        className="btn btn-outline btn-sm"
                        title={isWatched(stock._id) ? 'Remove from watchlist' : 'Add to watchlist'}
                        onClick={(e) => toggleWatch(e, stock)}
                      >
                        {isWatched(stock._id) ? '★' : '☆'}
                      </button>
                    )}
                    {onTrade && (
                      <button className="btn btn-primary btn-sm" onClick={() => onTrade(stock)}>
                        Trade
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
