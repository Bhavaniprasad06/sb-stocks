import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovers } from '../redux/slices/stockSlice';
import StockTable from '../components/StockTable';
import Spinner from '../components/Spinner';

const FEATURES = [
  {
    icon: '💵',
    title: 'Virtual Funds',
    desc: 'Start with $300,000 in play money and trade without any financial risk.',
  },
  {
    icon: '📈',
    title: 'Realistic Market Data',
    desc: 'Explore popular US stocks with price history, charts and sector data.',
  },
  {
    icon: '🛡️',
    title: 'Secure Accounts',
    desc: 'JWT-protected auth with encrypted passwords and role-based access.',
  },
  {
    icon: '📊',
    title: 'Portfolio Analytics',
    desc: 'Track gains, losses and performance with interactive charts.',
  },
  {
    icon: '⭐',
    title: 'Watchlists',
    desc: 'Follow your favorite stocks and jump into a trade in one click.',
  },
  {
    icon: '🧑‍💼',
    title: 'Admin Panel',
    desc: 'Admins manage listings, prices and market data from a dedicated panel.',
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const { movers, moversStatus } = useSelector((state) => state.stocks);

  useEffect(() => {
    dispatch(fetchMovers());
  }, [dispatch]);

  return (
    <div>
      <section className="hero">
        <h1>Practice trading US stocks.<br />No risk. Real experience.</h1>
        <p>
          SB Stocks is a paper trading platform where you buy and sell stocks with
          virtual money, build a portfolio, and sharpen your strategy — all in a
          realistic, educational environment.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary">
            Get Started Free
          </Link>
          <Link to="/login" className="btn btn-outline">
            Sign In
          </Link>
        </div>
      </section>

      <section className="grid grid-3" style={{ marginBottom: 40 }}>
        {FEATURES.map((f) => (
          <div className="card feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <div className="page-header">
        <div>
          <h1>Today's Market Movers</h1>
          <p>Top gainers, losers and most active listings</p>
        </div>
        <Link to="/register" className="btn btn-outline">
          Explore all markets →
        </Link>
      </div>

      {moversStatus === 'loading' ? (
        <Spinner />
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
          <div>
            <h3 className="pos" style={{ marginBottom: 10 }}>▲ Top Gainers</h3>
            <StockTable stocks={movers.gainers} showWatchlist={false} compact />
          </div>
          <div>
            <h3 className="neg" style={{ marginBottom: 10 }}>▼ Top Losers</h3>
            <StockTable stocks={movers.losers} showWatchlist={false} compact />
          </div>
        </div>
      )}
    </div>
  );
}
