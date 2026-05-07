import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register } from '../services/api';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'parent';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    surname: '',
    password: '',
    password_confirm: '',
    role: initialRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = searchParams.get('role');
    if (role) {
      setFormData((prev) => ({ ...prev, role }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters!');
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        username: formData.username,
        email: formData.email,
        surname: formData.surname,
        password: formData.password,
        confirm_password: formData.password_confirm,
        role: formData.role,
      };
      await register(registerData);
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error) {
      const errors = error.response?.data;
      let errorMessage = 'Registration failed. Please try again.';

      if (errors) {
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell fade-in">
      <section className="surface-panel auth-panel">
        <div className="auth-header">
          <span className="auth-badge">Create account</span>
          <h1 className="auth-title">Start tracking communication with a calmer, cleaner setup.</h1>
          <p className="auth-subtitle">
            Choose the role you are answering from, then create your account to save results over time.
          </p>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label-custom">I am answering as</label>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-option ${formData.role === 'parent' ? 'btn btn-primary-custom' : 'btn btn-secondary-custom'}`}
                onClick={() => handleRoleChange('parent')}
              >
                Parent
              </button>
              <button
                type="button"
                className={`segmented-option ${formData.role === 'child' ? 'btn btn-primary-custom' : 'btn btn-secondary-custom'}`}
                onClick={() => handleRoleChange('child')}
              >
                Child
              </button>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="username" className="form-label-custom">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control-custom"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength="3"
              />
            </div>

            <div className="form-field">
              <label htmlFor="email" className="form-label-custom">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control-custom"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="surname" className="form-label-custom">Surname</label>
              <input
                type="text"
                id="surname"
                name="surname"
                className="form-control-custom"
                placeholder="Enter family surname"
                value={formData.surname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password" className="form-label-custom">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-control-custom"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="8"
              />
            </div>

            <div className="form-field">
              <label htmlFor="password_confirm" className="form-label-custom">Confirm password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password_confirm"
                name="password_confirm"
                className="form-control-custom"
                placeholder="Re-enter your password"
                value={formData.password_confirm}
                onChange={handleChange}
                required
              />
            </div>

            <label className="check-row">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <span>Show password fields</span>
            </label>

            <button type="submit" className="btn btn-primary-custom" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="auth-footer">
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-deep)', fontWeight: 700 }}>Sign in</Link>
        </p>
      </section>
    </div>
  );
};

export default Register;
