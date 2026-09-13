import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/', label: 'Pradžia', end: true },
  { to: '/mokytis', label: 'Mokytis' },
  { to: '/zenklai', label: 'Ženklai' },
  { to: '/korteles', label: 'Kortelės' },
  { to: '/testas', label: 'Testas' },
  { to: '/egzaminas', label: 'Egzaminas' },
  { to: '/pazanga', label: 'Pažanga' },
];

export function Nav() {
  const { user, logout } = useAuth();

  return (
    <header className="nav">
      <NavLink to="/" className="nav-brand">
        <span className="nav-mark">K</span>
        <span>KET Mokykla</span>
      </NavLink>
      <nav className="nav-links" aria-label="Pagrindinė navigacija">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {l.label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Admin
          </NavLink>
        )}
        {user ? (
          <>
            <NavLink to="/paskyra" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {user.name}
            </NavLink>
            <button className="nav-link" type="button" onClick={logout}>
              Išeiti
            </button>
          </>
        ) : (
          <NavLink to="/paskyra" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Paskyra
          </NavLink>
        )}
      </nav>
    </header>
  );
}
