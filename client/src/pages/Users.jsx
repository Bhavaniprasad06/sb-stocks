import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client';
import Spinner from '../components/Spinner';

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/users?${params.toString()}`);
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(), 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  const startEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({ name: user.name, role: user.role, cash: user.cash, contact: user.contact || '' });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/admin/users/${id}`, editForm);
      toast.success('User updated');
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Deactivate ${user.name}?`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      toast.success('User deactivated');
      loadUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>{total} registered user(s)</p>
        </div>
        <span className="pill pill-blue">Admin only</span>
      </div>

      <div className="search-row" style={{ marginBottom: 16 }}>
        <input
          className="form-control"
          style={{ maxWidth: 360 }}
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="big">👤</div>
          <p>No users found.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Cash</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    {editingUser === u._id ? (
                      <>
                        <td>
                          <input
                            className="form-control"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                          />
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <input
                            className="form-control"
                            value={editForm.contact}
                            onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                          />
                        </td>
                        <td>
                          <select
                            className="form-select"
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <input
                            className="form-control"
                            type="number"
                            value={editForm.cash}
                            onChange={(e) => setEditForm({ ...editForm, cash: Number(e.target.value) })}
                            style={{ fontSize: '0.85rem', padding: '6px 10px', width: 100 }}
                          />
                        </td>
                        <td>{fmtDate(u.createdAt)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-green btn-sm" onClick={() => saveEdit(u._id)}>Save</button>
                            <button className="btn btn-outline btn-sm" onClick={() => setEditingUser(null)}>Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="stock-symbol">{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.contact || '—'}</td>
                        <td>
                          <span className={`pill ${u.role === 'admin' ? 'pill-blue' : 'pill-green'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{fmt(u.cash)}</td>
                        <td>{fmtDate(u.createdAt)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-outline btn-sm" onClick={() => startEdit(u)}>Edit</button>
                            {u.role !== 'admin' && (
                              <button className="btn btn-red btn-sm" onClick={() => handleDelete(u)}>Deactivate</button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span className="page-info">Page {page} of {pages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
