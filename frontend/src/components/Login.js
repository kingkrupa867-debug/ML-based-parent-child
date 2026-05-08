import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      /* api.js login() expects a single credentials object */
      const data = await login({ username: form.username, password: form.password });
      localStorage.setItem('token', data.token || 'session-authenticated');
      localStorage.setItem('user', JSON.stringify({
        username: data.username || form.username,
        role:     data.role || 'parent',
        surname:  data.surname || '',
      }));
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const d = err.response?.data;
      const msg =
        d?.non_field_errors?.[0] ||
        d?.detail ||
        d?.error ||
        'Invalid username or password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
    <div className="auth-page">
      {/* Left — SVG illustration panel */}
      <div className="auth-left auth-left-svg">
        <div className="auth-svg-top">
          <div className="auth-img-brand">CommQuality</div>
          <h2 className="auth-img-tagline">Welcome back!<br/>Sign in to continue.</h2>
        </div>
        <img
          src="/Login-pana.svg"
          alt="Login illustration"
          className="auth-svg-img"
        />
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-sub">Sign in to your CommQuality account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Username</label>
              <input
                type="text" name="username" className="auth-input"
                placeholder="Enter your username"
                value={form.username} onChange={handleChange}
                autoComplete="username" required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <input
                  type={showPwd ? 'text' : 'password'} name="password"
                  className="auth-input" placeholder="Enter your password"
                  value={form.password} onChange={handleChange}
                  autoComplete="current-password" required
                />
                <button type="button" className="auth-pwd-toggle"
                  onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-switch-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
