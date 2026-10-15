import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_HOME } from '../utils/roles.js';
import RoleBadge from './RoleBadge.jsx';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <span className="navbar__mark" aria-hidden="true">
            {'</>'}
          </span>
          DevVoluntário
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={open}
          aria-controls="navbar-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Fechar' : 'Menu'}
        </button>

        <nav id="navbar-menu" className={`navbar__menu${open ? ' navbar__menu--open' : ''}`}>
          {isAuthenticated ? (
            <>
              <NavLink to={ROLE_HOME[user.role]} className="navbar__link" onClick={closeMenu}>
                Meu painel
              </NavLink>

              <div className="navbar__user">
                <span className="navbar__avatar" aria-hidden="true">
                  {getInitials(user.name)}
                </span>
                <div className="navbar__identity">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <RoleBadge role={user.role} />
              </div>

              <button type="button" className="btn btn--ghost-light" onClick={handleLogout}>
                Sair
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="navbar__link" onClick={closeMenu}>
                Entrar
              </NavLink>
              <Link to="/register" className="btn btn--amber" onClick={closeMenu}>
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
