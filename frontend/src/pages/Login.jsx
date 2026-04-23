import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader, ShieldCheck, User } from 'lucide-react';
import { authAPI } from '../services/authAPI';
import '../Login.css';

const DEMO_ACCOUNTS = [
  { label: 'Admin', icon: ShieldCheck, email: 'admin@demo.com', password: 'password', color: '#6366f1' },
  { label: 'Staff', icon: User,        email: 'staff@demo.com', password: 'password', color: '#0ea5e9' },
];

const Login = ({ setCurrentPage, setUser, setIsAuthenticated }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your InventoryTrack account</p>
        </div>

        {/* Demo credential cards */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {DEMO_ACCOUNTS.map((acc) => {
            const Icon = acc.icon;
            return (
              <button
                key={acc.label}
                type="button"
                onClick={() => fillDemo(acc)}
                style={{
                  flex: 1,
                  background: '#1e293b',
                  border: `1.5px solid ${acc.color}33`,
                  borderRadius: '10px',
                  padding: '0.65rem 0.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = acc.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = `${acc.color}33`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <Icon size={14} color={acc.color} />
                  <span style={{ color: acc.color, fontSize: '12px', fontWeight: 600 }}>{acc.label}</span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '11px', lineHeight: 1.5 }}>
                  {acc.email}<br />
                  <span style={{ letterSpacing: '0.05em' }}>password</span>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #334155' }} />
          <span style={{ color: '#64748b', fontSize: '12px' }}>or enter manually</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #334155' }} />
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <><Loader size={18} className="spinner" /> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?
            <button className="link-btn" onClick={() => setCurrentPage('register')}>
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
