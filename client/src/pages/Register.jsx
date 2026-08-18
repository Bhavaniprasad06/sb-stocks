import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { registerUser } from '../redux/slices/authSlice';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', contact: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const loading = status === 'loading';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const result = await dispatch(
      registerUser({ name: form.name, email: form.email, password: form.password, contact: form.contact })
    );
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created — $300,000 in virtual cash is yours!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Create your account 🚀</h1>
        <p className="subtitle">Start paper trading with $300,000 in virtual cash</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              className="form-control"
              required
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="form-control"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact">Contact (optional)</label>
            <input
              id="contact"
              className="form-control"
              type="tel"
              placeholder="Phone number"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="form-control"
              type="password"
              required
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              className="form-control"
              type="password"
              required
              placeholder="Repeat password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>

          {error && <div className="error-text" style={{ marginBottom: 12 }}>{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
