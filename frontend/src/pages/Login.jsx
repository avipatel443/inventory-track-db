import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { authAPI } from '../services/authAPI';
import '../Login.css';

const Login = ({ setCurrentPage, setUser, setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update app state
      setUser(user);
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your InventoryTrack account</p>
          <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px', display: 'block' }}>
            Demo: admin@example.com / password
          </small>
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

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={18} className="spinner" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?
            <button
              className="link-btn"
              onClick={() => setCurrentPage('register')}
            >
              Sign up
            </button>
          </p>
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button
              className="link-btn"
              onClick={() => {
                setEmail('admin@example.com');
                setPassword('password');
              }}
              style={{ fontSize: '12px', color: '#6b7280' }}
            >
              Use demo credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
