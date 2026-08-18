import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: '📈',
    title: 'Real-Time Market Data',
    desc: 'Live US stock prices updated every minute from Yahoo Finance. Practice with real market conditions.',
  },
  {
    icon: '💰',
    title: 'Virtual Trading',
    desc: 'Start with $300,000 in virtual cash. Buy and sell stocks without any financial risk.',
  },
  {
    icon: '📊',
    title: 'Portfolio Analytics',
    desc: 'Track gains, losses and performance with interactive charts and detailed analytics.',
  },
  {
    icon: '🔍',
    title: 'Historical Trends',
    desc: 'Access stock performance history with SMA indicators to analyze and test strategies.',
  },
  {
    icon: '⭐',
    title: 'Watchlists',
    desc: 'Follow your favorite stocks and jump into a trade in one click.',
  },
  {
    icon: '🛡️',
    title: 'Secure & Private',
    desc: 'JWT-protected auth with encrypted passwords. Your data stays safe.',
  },
];

const STEPS = [
  { num: '1', title: 'Register', desc: 'Create a free account in seconds' },
  { num: '2', title: 'Explore', desc: 'Browse 40+ US-listed stocks with live data' },
  { num: '3', title: 'Trade', desc: 'Buy and sell with $100K virtual cash' },
  { num: '4', title: 'Learn', desc: 'Track performance and refine your strategy' },
];

export default function Landing() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  if (user) return null;

  return (
    <div>
      {/* Hero */}
      <section className="hero" style={{ paddingTop: 60, paddingBottom: 50 }}>
        <h1>Practice Trading US Stocks.<br />No Risk. Real Experience.</h1>
        <p>
          SB Stocks is a paper trading platform where you buy and sell stocks with
          virtual money, build a portfolio, and sharpen your strategy — all in a
          realistic, educational environment.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
            Get Started Free 🚀
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 28, fontSize: '1.5rem' }}>How It Works</h2>
        <div className="grid grid-4">
          {STEPS.map((s) => (
            <div className="card" key={s.num} style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)',
                color: '#fff', display: 'grid', placeItems: 'center', fontSize: '1.2rem',
                fontWeight: 700, margin: '0 auto 12px',
              }}>{s.num}</div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>{s.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 28, fontSize: '1.5rem' }}>Everything You Need</h2>
        <div className="grid grid-3">
          {FEATURES.map((f) => (
            <div className="card feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: 40 }}>
        <h2 style={{ marginBottom: 12 }}>Ready to Start Trading?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
          Join thousands of learners practicing stock trading with zero financial risk.
        </p>
        <Link to="/register" className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '1.05rem' }}>
          Create Free Account
        </Link>
      </section>
    </div>
  );
}
