import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { updateProfile } from '../redux/slices/authSlice';
import StatCard from '../components/StatCard';

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const cash = useSelector((state) => state.portfolio.cash);
  const positionsValue = useSelector((state) => state.portfolio.positionsValue);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', contact: user?.contact || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    const result = await dispatch(updateProfile({ name: form.name, contact: form.contact }));
    setSaving(false);
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated');
      setEditing(false);
    } else {
      toast.error(result.payload || 'Failed to update profile');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account details</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
              color: '#fff', display: 'grid', placeItems: 'center',
              fontSize: '1.6rem', fontWeight: 700,
            }}>{initials}</div>
            <div>
              <h2 style={{ fontSize: '1.3rem' }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
              <span className={`pill ${user?.role === 'admin' ? 'pill-blue' : 'pill-green'}`}>
                {user?.role === 'admin' ? 'Admin' : 'Trader'}
              </span>
            </div>
          </div>

          {editing ? (
            <div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Contact</label>
                <input
                  className="form-control"
                  type="tel"
                  value={form.contact}
                  placeholder="Phone number"
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button className="btn btn-outline" onClick={() => { setEditing(false); setForm({ name: user?.name, contact: user?.contact || '' }); }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="stat-row">
                <span className="stat-row-label">Name</span>
                <span className="stat-row-value">{user?.name}</span>
              </div>
              <div className="stat-row">
                <span className="stat-row-label">Email</span>
                <span className="stat-row-value">{user?.email}</span>
              </div>
              <div className="stat-row">
                <span className="stat-row-label">Contact</span>
                <span className="stat-row-value">{user?.contact || '—'}</span>
              </div>
              <div className="stat-row">
                <span className="stat-row-label">Role</span>
                <span className="stat-row-value">{user?.role === 'admin' ? 'Admin' : 'Trader'}</span>
              </div>
              <div className="stat-row">
                <span className="stat-row-label">Member Since</span>
                <span className="stat-row-value">{fmtDate(user?.createdAt)}</span>
              </div>
              <button className="btn btn-outline" onClick={() => setEditing(true)} style={{ marginTop: 16 }}>
                Edit Profile
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <StatCard label="Virtual Cash" value={fmt(cash)} sub="Available to trade" />
            <StatCard label="Positions Value" value={fmt(positionsValue)} sub="Invested in stocks" />
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Account Summary</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7 }}>
              Your SB Stocks account comes with <strong>$300,000</strong> in virtual cash.
              Use it to practice buying and selling US-listed stocks without any financial risk.
              Track your portfolio performance, analyze trends, and refine your trading strategy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
