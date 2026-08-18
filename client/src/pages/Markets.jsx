import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStocks, fetchSectors } from '../redux/slices/stockSlice';
import { fetchWatchlist } from '../redux/slices/watchlistSlice';
import StockTable from '../components/StockTable';
import TradeModal from '../components/TradeModal';
import Spinner from '../components/Spinner';

export default function Markets() {
  const dispatch = useDispatch();
  const { stocks, status, total, page, pages, sectors } = useSelector((state) => state.stocks);
  const [filters, setFilters] = useState({ search: '', sector: '', sort: '', page: 1 });
  const [tradeStock, setTradeStock] = useState(null);
  const [tradeMode, setTradeMode] = useState('buy');

  // Debounce the search box
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchStocks({ ...filters, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search, filters.sector, filters.sort, dispatch]);

  useEffect(() => {
    dispatch(fetchStocks({ ...filters }));
  }, [filters.page, dispatch]);

  useEffect(() => {
    dispatch(fetchSectors());
    dispatch(fetchWatchlist());
  }, [dispatch]);

  const openTrade = (stock, mode = 'buy') => {
    setTradeMode(mode);
    setTradeStock(stock);
  };

  const changePage = (p) => {
    if (p >= 1 && p <= pages) {
      setFilters((f) => ({ ...f, page: p }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Markets</h1>
          <p>
            {total.toLocaleString()} US listings · Search, filter and trade with virtual cash
          </p>
        </div>
      </div>

      <div className="search-row">
        <input
          className="form-control"
          type="text"
          placeholder="Search by symbol or company name… (e.g. AAPL, Tesla)"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="form-select"
          value={filters.sector}
          onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
        >
          <option value="">All sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          <option value="">Sort: A–Z</option>
          <option value="price">Price: Low → High</option>
          <option value="priceDesc">Price: High → Low</option>
          <option value="gainers">Top Gainers</option>
          <option value="losers">Top Losers</option>
          <option value="volume">Most Active</option>
        </select>
      </div>

      {status === 'loading' ? (
        <Spinner />
      ) : stocks.length === 0 ? (
        <div className="empty-state">
          <div className="big">🔍</div>
          <p>No stocks match your search. Try a different symbol or clear filters.</p>
        </div>
      ) : (
        <>
          <StockTable stocks={stocks} onTrade={(s) => openTrade(s, 'buy')} />

          {pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => changePage(page - 1)}
              >
                ← Prev
              </button>
              <span className="page-info">
                Page {page} of {pages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= pages}
                onClick={() => changePage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {tradeStock && (
        <TradeModal
          stock={tradeStock}
          mode={tradeMode}
          onClose={() => setTradeStock(null)}
        />
      )}
    </div>
  );
}
