import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import navbarLogo from '../assets/fitmap-logo-navbar.svg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, toggleLang } = useLang();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const close = () => setOpen(false);

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
        {navLink('/venues', lang === 'bg' ? 'Зали' : 'Venues')}
        {navLink('/trainers', lang === 'bg' ? 'Треньори' : 'Trainers')}
        {user ? (
          <>
            {(user.role === 'owner' || user.role === 'admin') && navLink('/my-venues', lang === 'bg' ? 'Моите Зали' : 'My Venues')}
            {user.role === 'admin' && navLink('/admin', lang === 'bg' ? 'Админ' : 'Admin')}
            {navLink('/profile', user.name)}
            <button onClick={() => { logout(); close(); }}>
              {lang === 'bg' ? 'Изход' : 'Log Out'}
            </button>
          </>
        ) : (
          <>
            {navLink('/login', lang === 'bg' ? 'Вход' : 'Log In')}
            {navLink('/signup', lang === 'bg' ? 'Регистрация' : 'Sign Up')}
          </>
        )}
        <button className="lang-toggle" onClick={toggleLang}>
          {lang === 'en' ? 'BG' : 'EN'}
        </button>
      </div>

      {open && <div className="navbar-overlay" onClick={close} />}
    </nav>
  );
}
