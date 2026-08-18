import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import WatchlistPage from './pages/Watchlist';
import History from './pages/History';
import Profile from './pages/Profile';
import AllOrders from './pages/AllOrders';
import AllTransactions from './pages/AllTransactions';
import Admin from './pages/Admin';
import Users from './pages/Users';
import AdminStockChart from './pages/AdminStockChart';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/markets"
            element={
              <ProtectedRoute>
                <Markets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/markets/:symbol"
            element={
              <ProtectedRoute>
                <StockDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <WatchlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AllOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <AllTransactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/charts"
            element={
              <ProtectedRoute adminOnly>
                <AdminStockChart />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer className="footer">
        <p>SB Stocks · Virtual paper trading for learning &amp; practice — no real money involved.</p>
      </footer>
    </div>
  );
}
