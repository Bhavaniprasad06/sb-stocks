import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectAuth } from '../redux/slices/authSlice';
import { fetchPortfolio } from '../redux/slices/portfolioSlice';
import { useTheme, toggleTheme } from '../theme';

const fmt = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  const cash = useSelector((state) => state.portfolio.cash);
  const theme = useTheme();

  useEffect(() => {
    if (user) {
      dispatch(fetchPortfolio());
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setOpen(false);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={user ? '/dashboard' : '/'} className="brand" onClick={() => setOpen(false)}>
          <span className="brand-logo">SB</span>
          SB Stocks
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          {open ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {user ? (
            <>
              <NavLink to="/dashboard" className="nav-link" onClick={() => setOpen(false)}>
                Dashboard
              </NavLink>
              <NavLink to="/markets" className="nav-link" onClick={() => setOpen(false)}>
                Markets
              </NavLink>
              <NavLink to="/portfolio" className="nav-link" onClick={() => setOpen(false)}>
                Portfolio
              </NavLink>
              <NavLink to="/watchlist" className="nav-link" onClick={() => setOpen(false)}>
                Watchlist
              </NavLink>
              <NavLink to="/history" className="nav-link" onClick={() => setOpen(false)}>
                History
              </NavLink>
              {user.role === 'admin' && (
                <>
                  <NavLink to="/admin" className="nav-link" onClick={() => setOpen(false)}>
                    Admin
                  </NavLink>
                  <NavLink to="/admin/users" className="nav-link" onClick={() => setOpen(false)}>
                    Users
                  </NavLink>
                  <NavLink to="/admin/charts" className="nav-link" onClick={() => setOpen(false)}>
                    Charts
                  </NavLink>
                </>
              )}
            </>
          ) : (
            <>
              <NavLink to="/" className="nav-link" onClick={() => setOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/login" className="nav-link" onClick={() => setOpen(false)}>
                Login
              </NavLink>
              <NavLink to="/register" className="nav-link" onClick={() => setOpen(false)}>
                Register
              </NavLink>
            </>
          )}
        </nav>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user ? (
          <div className="nav-user">
            <span className="nav-cash" title="Available virtual cash">
              {fmt(cash || 0)}
            </span>
            <Link to="/profile" className="avatar" title={user.name} style={{ textDecoration: 'none' }}>
              {initials}
            </Link>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-user">
            <Link to="/login" className="btn btn-outline btn-sm">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
