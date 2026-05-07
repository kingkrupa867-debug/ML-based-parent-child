import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/api';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsLoggedIn(Boolean(token));
    setUser(userData ? JSON.parse(userData) : null);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
      navigate('/login');
    }
  };

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <Link className="brand-block" to={isLoggedIn ? "/dashboard" : "/"}>
          <span className="brand-mark">CommQuality</span>
          <span className="brand-note">Parent-child communication review</span>
        </Link>

        <div className="nav-links">
          {isLoggedIn ? (
            <>
              <Link className={`nav-link-custom ${isActive('/dashboard')}`} to="/dashboard">
                Dashboard
              </Link>
              <Link className={`nav-link-custom ${isActive('/questionnaire')}`} to="/questionnaire">
                Assessment
              </Link>
              <Link className={`nav-link-custom ${isActive('/history')}`} to="/history">
                History
              </Link>
              <span className="nav-user">{user?.username || 'User'}</span>
              <button className="btn btn-secondary-custom" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className={`nav-link-custom ${isActive('/login')}`} to="/login">
                Login
              </Link>
              <Link className="btn btn-primary-custom" to="/register">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
