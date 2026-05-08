import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';

const AppNavbar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [user, setUser]           = useState(null);
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setLoggedIn(Boolean(token));
    setUser(userData ? JSON.parse(userData) : null);
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (to) => {
    if (to === '/session') {
      return ['/session', '/questionnaire', '/child-entry'].some(p =>
        location.pathname === p || location.pathname.startsWith(p)
      );
    }
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === to;
  };

  const handleLogout = async () => {
    try { await logout(); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Protected link click → redirect to login if not authed
  const handleNavClick = (e, isProtected) => {
    if (isProtected && !isLoggedIn) {
      e.preventDefault();
      navigate('/login');
    }
  };

  /* ── LEFT links: Home · Dashboard(if logged in) · Assessment · History ── */
  const leftLinks = [
    ...(isLoggedIn ? [{ to: '/dashboard', label: 'Dashboard', protected: true }] : []),
    { to: '/session',   label: 'Assessment', protected: true  },
    { to: '/history',   label: 'History',    protected: true  },
  ];

  /* ── RIGHT links: About · Contact ── always visible ── */
  const rightLinks = [
    { to: '/about',   label: 'About'   },
    { to: '/contact', label: 'Contact' },
  ];

  const allMobileLinks = [...leftLinks, ...rightLinks];

  return (
    <>
      {/* Spacer */}
      <div className="hn-spacer" />

      <div className={`hn-wrap ${scrolled ? 'hn-scrolled' : ''}`}>
        <nav className="hn-pill">

          {/* Brand */}
          <Link to="/" className="hn-brand">
            <div className="hn-brand-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 2h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-3 3v-3H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="rgba(255,255,255,0.9)"/>
                <path d="M13 8h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1v2l-3-2h-3a2 2 0 0 1-2-2v-1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" fill="none"/>
              </svg>
            </div>
            <span className="hn-brand-name">CommQuality</span>
          </Link>

          <div className="hn-sep" />

          {/* LEFT nav links: Home · Dashboard · Assessment · History */}
          <div className="hn-links">
            {leftLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hn-link ${isActive(link.to) ? 'hn-link-active' : ''} ${link.protected && !isLoggedIn ? 'hn-link-locked' : ''}`}
                onClick={(e) => handleNavClick(e, link.protected)}
              >
                {link.label}
                {isActive(link.to) && <span className="hn-active-pill" />}
              </Link>
            ))}
          </div>

          {/* Spacer pushes right links to the end */}
          <div style={{ flex: 1 }} />

          {/* RIGHT nav links: About · Contact */}
          <div className="hn-links hn-links-right">
            {rightLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hn-link ${isActive(link.to) ? 'hn-link-active' : ''}`}
              >
                {link.label}
                {isActive(link.to) && <span className="hn-active-pill" />}
              </Link>
            ))}
          </div>

          <div className="hn-sep" />

          {/* Auth actions */}
          <div className="hn-actions">
            {isLoggedIn ? (
              <>
                <span className="hn-user-chip">
                  <span className="hn-user-avatar">{(user?.username || 'U')[0].toUpperCase()}</span>
                  {user?.username || 'User'}
                </span>
                <button className="hn-btn-ghost" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"    className="hn-btn-ghost">Sign in</Link>
                <Link to="/register" className="hn-btn-solid">Get started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`hn-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </nav>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="hn-mobile-menu">
            {allMobileLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hn-mobile-link ${isActive(link.to) ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, link.protected)}
              >
                {link.label}
              </Link>
            ))}
            <div className="hn-mobile-divider" />
            {isLoggedIn ? (
              <button className="hn-mobile-link" onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <Link to="/login"    className="hn-mobile-link">Sign in</Link>
                <Link to="/register" className="hn-mobile-link hn-mobile-cta">Get started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AppNavbar;
