import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Pradžia', end: true },
  { to: '/mokytis', label: 'Mokytis' },
  { to: '/zenklai', label: 'Ženklai' },
  { to: '/testas', label: 'Testas' },
  { to: '/egzaminas', label: 'Egzaminas' },
  { to: '/pazanga', label: 'Pažanga' },
];

export function Nav() {
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
      </nav>
    </header>
  );
}
