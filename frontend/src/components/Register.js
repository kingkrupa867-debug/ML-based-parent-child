import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register, setAuthToken } from '../services/api';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    username: '', surname: '', email: '',
    password: '', confirm_password: '',
    role: searchParams.get('role') || 'parent',
  });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    const r = searchParams.get('role');
    if (r) setForm(f => ({ ...f, role: r }));
  }, [searchParams]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.surname.trim()) { toast.error('Surname is required.'); return; }
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match.'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      /* api.js register() expects a single object */
      const data = await register({
        username:         form.username,
        surname:          form.surname.trim(),
        email:            form.email,
        password:         form.password,
        confirm_password: form.confirm_password,
        role:             form.role,
      });
      /* Store the real auth token returned by the backend */
      setAuthToken(data.token);
      localStorage.setItem('user', JSON.stringify({
        username: data.username || form.username,
        role:     data.role || form.role,
      }));
      toast.success('Account created! Welcome.');
      navigate('/dashboard');
    } catch (err) {
      const d = err.response?.data;
      const msg =
        d?.non_field_errors?.[0] ||
        d?.username?.[0] ||
        d?.surname?.[0] ||
        d?.email?.[0] ||
        d?.password?.[0] ||
        d?.error ||
        'Registration failed. Please check your details.';
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
          <h2 className="auth-img-tagline">Join families building<br/>stronger bonds.</h2>
        </div>
        <img
          src="/Login-pana.svg"
          alt="Register illustration"
          className="auth-svg-img"
        />
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Create your account</h1>
            <p className="auth-form-sub">
              Registering as{' '}
              <span className="auth-role-badge">{form.role === 'parent' ? 'Parent' : 'Child'}</span>
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>

            {/* Username + Surname row */}
            <div className="auth-2col">
              <div className="auth-field">
                <label className="auth-label">Username *</label>
                <input type="text" name="username" className="auth-input"
                  placeholder="e.g. john_doe" value={form.username}
                  onChange={handleChange} autoComplete="username" required />
              </div>
              <div className="auth-field">
                <label className="auth-label">Surname *</label>
                <input type="text" name="surname" className="auth-input"
                  placeholder="e.g. Smith" value={form.surname}
                  onChange={handleChange} required />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input type="email" name="email" className="auth-input"
                placeholder="your@email.com" value={form.email}
                onChange={handleChange} autoComplete="email" />
            </div>

            {/* Password + Confirm row */}
            <div className="auth-2col">
              <div className="auth-field">
                <label className="auth-label">Password *</label>
                <div className="auth-input-wrap">
                  <input type={showPwd ? 'text' : 'password'} name="password"
                    className="auth-input" placeholder="Min. 8 chars"
                    value={form.password} onChange={handleChange}
                    autoComplete="new-password" required />
                  <button type="button" className="auth-pwd-toggle"
                    onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">Confirm password *</label>
                <input type={showPwd ? 'text' : 'password'} name="confirm_password"
                  className="auth-input" placeholder="Repeat password"
                  value={form.confirm_password} onChange={handleChange}
                  autoComplete="new-password" required />
              </div>
            </div>

            {/* Role toggle */}
            <div className="auth-field">
              <label className="auth-label">I am a *</label>
              <div className="auth-role-toggle">
                {['parent', 'child'].map(r => (
                  <button key={r} type="button"
                    className={`auth-role-toggle-btn ${form.role === r ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, role: r }))}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Register;
