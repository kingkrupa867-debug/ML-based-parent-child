import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';

const PUBLIC_NAV = [
  { to: '/',        icon: '🏠', label: 'Home'    },
  { to: '/about',   icon: 'ℹ️',  label: 'About'   },
  { to: '/contact', icon: '✉️',  label: 'Contact' },
];

const AUTH_NAV = [
  { to: '/dashboard',     icon: '📊', label: 'Dashboard'  },
  { to: '/questionnaire', icon: '📝', label: 'Assessment' },
  { to: '/history',       icon: '📈', label: 'History'    },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const [user, setUser]         = useState(null);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setLoggedIn(Boolean(token));
    setUser(userData ? JSON.parse(userData) : null);
  }, [location]);

  const isActive = (to) => location.pathname === to;

  const handleLogout = async () => {
    try { await logout(); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = isLoggedIn ? AUTH_NAV : PUBLIC_NAV;

  return (
    <aside className="lp-sidebar">
      {/* Brand */}
      <div className="lp-brand">
        <div className="lp-brand-icon">💬</div>
        <div>
          <div className="lp-brand-name">CommQuality</div>
          <div className="lp-brand-sub">Communication analyzer</div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="lp-nav">
        {navItems.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`lp-nav-item ${isActive(to) ? 'active' : ''}`}
          >
            <span className="lp-nav-icon">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="lp-nav-divider" />

      {/* Auth section */}
      {isLoggedIn ? (
        <button className="lp-nav-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <span className="lp-nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      ) : (
        <>
          <Link to="/login"    className="lp-nav-item">
            <span className="lp-nav-icon">🔑</span><span>Sign in</span>
          </Link>
          <Link to="/register" className="lp-nav-item lp-nav-cta">
            <span className="lp-nav-icon">✨</span><span>Register free</span>
          </Link>
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* User footer */}
      <div className="lp-sidebar-footer">
        <div className="lp-avatar">{isLoggedIn ? (user?.username?.[0]?.toUpperCase() || 'U') : 'CQ'}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>
            {isLoggedIn ? user?.username || 'User' : 'CommQuality'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {isLoggedIn ? (user?.role === 'parent' ? '👨‍👧 Parent' : '🧒 Child') : 'v1.0 · Free'}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
