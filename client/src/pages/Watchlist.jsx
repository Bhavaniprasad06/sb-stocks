import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWatchlist } from '../redux/slices/watchlistSlice';
import { fetchStocks } from '../redux/slices/stockSlice';
import StockTable from '../components/StockTable';
import TradeModal from '../components/TradeModal';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';

export default function WatchlistPage() {
  const dispatch = useDispatch();
  const { stocks, status } = useSelector((state) => state.watchlist);
  const allStocks = useSelector((state) => state.stocks.stocks);
  const [tradeStock, setTradeStock] = useState(null);

  useEffect(() => {
    dispatch(fetchWatchlist());
    if (allStocks.length === 0) {
      dispatch(fetchStocks({ limit: 50 }));
    }
  }, [dispatch]);

  const tradingStock = tradeStock
    ? { _id: tradeStock._id, symbol: tradeStock.symbol, name: tradeStock.name, price: tradeStock.price }
    : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Watchlist</h1>
          <p>Stocks you're following — tap ☆ in any table to add or remove</p>
        </div>
        <Link to="/markets" className="btn btn-outline">Browse markets →</Link>
      </div>

      {status === 'loading' ? (
        <Spinner />
      ) : stocks.length === 0 ? (
        <div className="empty-state">
          <div className="big">⭐</div>
          <p>
            Your watchlist is empty. Head to the{' '}
            <Link to="/markets">markets</Link> and click ☆ on any stock to track it here.
          </p>
        </div>
      ) : (
        <StockTable stocks={stocks} onTrade={(s) => setTradeStock(s)} />
      )}

      {tradingStock && (
        <TradeModal stock={tradingStock} mode="buy" onClose={() => setTradeStock(null)} />
      )}
    </div>
  );
}
