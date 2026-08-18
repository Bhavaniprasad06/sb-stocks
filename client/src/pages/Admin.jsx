import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../api/client';
import { fetchStocks } from '../redux/slices/stockSlice';
import Spinner from '../components/Spinner';

const EMPTY_FORM = {
  symbol: '',
  name: '',
  price: '',
  sector: 'Technology',
  industry: '',
  marketCap: '',
  volume: '',
};

export default function Admin() {
  const dispatch = useDispatch();
  const { stocks, total } = useSelector((state) => state.stocks);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadStocks = async () => {
    setListLoading(true);
    try {
      await dispatch(fetchStocks({ search, limit: 100 })).unwrap();
    } catch {
      toast.error('Failed to load stocks');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.symbol || !form.name || !form.price) {
      toast.error('Symbol, name and price are required');
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/stocks/${editingId}`, {
          name: form.name,
          price: Number(form.price),
          sector: form.sector,
          industry: form.industry,
          marketCap: Number(form.marketCap) || 0,
          volume: Number(form.volume) || 0,
        });
        toast.success(`${form.symbol} updated`);
      } else {
        await api.post('/stocks', { ...form, price: Number(form.price) });
        toast.success(`${form.symbol.toUpperCase()} added to the market`);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadStocks();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (stock) => {
    setEditingId(stock._id);
    setForm({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      sector: stock.sector || 'Technology',
      industry: stock.industry || '',
      marketCap: stock.marketCap || '',
      volume: stock.volume || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeactivate = async (stock) => {
    if (!window.confirm(`Deactivate ${stock.symbol}? It will be hidden from users.`)) return;
    try {
      await api.delete(`/stocks/${stock._id}`);
      toast.success(`${stock.symbol} deactivated`);
      loadStocks();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Manage stock listings · {total.toLocaleString()} active stocks</p>
        </div>
        <span className="pill pill-blue">Admin only</span>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>
            {editingId ? `Edit ${form.symbol}` : 'Add New Stock'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="form-group">
                <label>Symbol</label>
                <input
                  className="form-control"
                  placeholder="AAPL"
                  value={form.symbol}
                  disabled={!!editingId}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="form-group">
                <label>Company name</label>
                <input
                  className="form-control"
                  placeholder="Apple Inc."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="214.29"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Sector</label>
                <input
                  className="form-control"
                  placeholder="Technology"
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input
                  className="form-control"
                  placeholder="Consumer Electronics"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Market cap ($)</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  placeholder="3260000000000"
                  value={form.marketCap}
                  onChange={(e) => setForm({ ...form, marketCap: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Volume</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  placeholder="52400000"
                  value={form.volume}
                  onChange={(e) => setForm({ ...form, volume: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Saving…' : editingId ? 'Save Changes' : 'Add Stock'}
              </button>
              {editingId && (
                <button className="btn btn-outline" type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Quick Tips</h3>
          <ul style={{ color: 'var(--text-muted)', fontSize: '0.92rem', paddingLeft: 18, display: 'grid', gap: 8 }}>
            <li>Updating a stock's price automatically recalcs its daily change.</li>
            <li>Deactivating a stock hides it from the markets for users.</li>
            <li>New listings are instantly tradable by all users.</li>
            <li>Symbols are case-insensitive and must be unique.</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="search-row" style={{ marginBottom: 14 }}>
          <h3 style={{ marginRight: 'auto' }}>Manage Listings</h3>
          <input
            className="form-control"
            style={{ maxWidth: 300 }}
            placeholder="Search stocks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {listLoading ? (
          <Spinner />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Change %</th>
                  <th>Sector</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => (
                  <tr key={s._id}>
                    <td className="stock-symbol">{s.symbol}</td>
                    <td>{s.name}</td>
                    <td>${s.price}</td>
                    <td className={s.changePercent >= 0 ? 'pos' : 'neg'}>
                      {s.changePercent >= 0 ? '+' : ''}
                      {s.changePercent}%
                    </td>
                    <td>
                      <span className="tag">{s.sector}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => startEdit(s)}>
                          Edit
                        </button>
                        <button className="btn btn-red btn-sm" onClick={() => handleDeactivate(s)}>
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
