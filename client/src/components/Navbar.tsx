import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import navbarLogo from '../assets/fitmap-logo-navbar.svg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const close = () => setOpen(false);

  // Close menu on navigation
  const navLink = (to: string, label: string) => (
    <Link to={to} onClick={close} className={location.pathname === to ? 'active' : ''}>
      {label}
    </Link>
  );

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={close}>
        <img src={navbarLogo} alt="FitMap" className="navbar-logo" />
      </Link>

      <button
        className={`hamburger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`navbar-links ${open ? 'open' : ''}`}>
        {navLink('/venues', 'Venues')}
        {user ? (
          <>
            {user.role === 'admin' && navLink('/admin', 'Admin')}
            {navLink('/profile', user.name)}
            <button onClick={() => { logout(); close(); }}>Log Out</button>
          </>
        ) : (
          <>
            {navLink('/login', 'Log In')}
            {navLink('/signup', 'Sign Up')}
          </>
        )}
      </div>

      {open && <div className="navbar-overlay" onClick={close} />}
    </nav>
  );
}
