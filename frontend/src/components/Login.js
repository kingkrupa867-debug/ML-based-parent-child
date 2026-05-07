import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(formData);
      localStorage.setItem('user', JSON.stringify({
        username: response.username,
        role: response.role,
        surname: response.surname,
        family_id: response.family_id,
      }));
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell fade-in">
      <section className="surface-panel auth-panel">
        <div className="auth-header">
          <span className="auth-badge">Sign in</span>
          <h1 className="auth-title">Pick up where your last assessment left off.</h1>
          <p className="auth-subtitle">
            Open your dashboard, review previous scores, and start a new communication check-in.
          </p>
        </div>

        <form className="form-grid" id="loginForm" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="username" className="form-label-custom">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control-custom"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password" className="form-label-custom">Password</label>
            <div className="password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-control-custom"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                className="btn btn-ghost-custom toggle-btn"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary-custom" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Need an account? <Link to="/register" style={{ color: 'var(--primary-deep)', fontWeight: 700 }}>Create one now</Link>
        </p>
      </section>
    </div>
  );
};

export default Login;
