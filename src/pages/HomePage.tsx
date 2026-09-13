import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';

export function HomePage() {
  const { studiedPct, progress } = useProgress();

  return (
    <>
      <section className="hero">
        <div className="hero-road" aria-hidden />
        <div className="hero-content">
          <p className="hero-brand">KET 2026</p>
          <h1>Išmok kelių eismo taisykles interaktyviai</h1>
          <p className="lead">
            Skyriai, ženklai, kortelės ir Regitros stiliaus egzaminas — pagal aktualią 2026-01-01
            redakciją. Turinys atviras be paskyros; registracija išsaugo mokymosi istoriją.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" to="/mokytis">
              Pradėti mokytis
            </Link>
            <Link className="btn btn-ghost" to="/egzaminas">
              Simuliuoti egzaminą
            </Link>
          </div>
          {(studiedPct > 0 || progress.streak > 0) && (
            <p className="lead" style={{ marginTop: '1.5rem', fontSize: '0.95rem' }}>
              Jūsų pažanga: {studiedPct}% taisyklių · {progress.streak} d. serija
            </p>
          )}
        </div>
      </section>

      <section className="update-banner">
        <span className="eyebrow">Nuo 2026-01-01</span>
        <h2>Šalmas privalomas visiems paspirtukininkams</h2>
        <p>
          Elektrine mikrojudumo priemone važiuojant šalmas turi būti užsidėtas ir užsisegtas visiems,
          visur. Nuomojant — šalmą privalo duoti nuomotojas. Dviračiui taisyklė nesikeitė: iki 18 m.
        </p>
        <Link className="btn btn-primary" to="/mokytis/mikromobilumas">
          Skyrius VIII¹
        </Link>
      </section>

      <section style={{ marginTop: '0.5rem', paddingBottom: '1rem' }}>
        <div className="mode-grid">
          <Link className="mode-link" to="/mokytis" style={{ animationDelay: '0.05s' }}>
            <div className="icon">01</div>
            <h3>Skyriai</h3>
            <p>Skaitykite KET santraukas su patarimais egzaminui.</p>
          </Link>
          <Link className="mode-link" to="/zenklai" style={{ animationDelay: '0.12s' }}>
            <div className="icon">02</div>
            <h3>Ženklai</h3>
            <p>Mokykitės kelio ženklų ir kartokite kortelėmis.</p>
          </Link>
          <Link className="mode-link" to="/testas" style={{ animationDelay: '0.19s' }}>
            <div className="icon">03</div>
            <h3>Testai</h3>
            <p>Trumpi klausimynai pagal temą su paaiškinimais.</p>
          </Link>
          <Link className="mode-link" to="/egzaminas" style={{ animationDelay: '0.26s' }}>
            <div className="icon">04</div>
            <h3>Egzaminas</h3>
            <p>30 klausimų, 30 min., išlaikyti reikia 24 teisingus.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
