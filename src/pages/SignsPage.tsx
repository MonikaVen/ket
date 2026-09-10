import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SignVisual } from '../components/SignVisual';
import { signCategories, signs } from '../data/signs';
import type { SignCategory } from '../data/types';
import { useProgress } from '../hooks/useProgress';

export function SignsPage() {
  const [cat, setCat] = useState<SignCategory | 'all'>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const { progress, markSignMastered } = useProgress();

  const filtered = useMemo(
    () => (cat === 'all' ? signs : signs.filter((s) => s.category === cat)),
    [cat],
  );
  const active = signs.find((s) => s.id === activeId) ?? null;

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">1 priedas</span>
          <h1>Kelio ženklai</h1>
          <p>Peržiūrėkite ženklus pagal grupes ir pažymėkite išmoktus. Kortelėmis kartokite atmintinai.</p>
        </div>
        <Link className="btn btn-primary" to="/korteles">
          Kortelės
        </Link>
      </div>

      <div className="filters">
        <button
          className={`chip${cat === 'all' ? ' active' : ''}`}
          onClick={() => setCat('all')}
        >
          Visi
        </button>
        {signCategories.map((c) => (
          <button
            key={c.id}
            className={`chip${cat === c.id ? ' active' : ''}`}
            onClick={() => setCat(c.id)}
            title={c.hint}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="signs-grid">
        {filtered.map((sign, i) => {
          const mastered = progress.masteredSigns.includes(sign.id);
          return (
            <button
              key={sign.id}
              className={`sign-card${activeId === sign.id ? ' active' : ''}${
                mastered ? ' mastered' : ''
              }`}
              style={{ animationDelay: `${(i % 12) * 0.03}s` }}
              onClick={() => setActiveId(sign.id)}
            >
              <SignVisual sign={sign} className="sign-visual" />
              <h3>{sign.name}</h3>
              <div className="code">{sign.code}</div>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="detail-panel">
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <SignVisual sign={active} className="sign-visual" />
            <div style={{ flex: 1, minWidth: 220 }}>
              <span className="eyebrow">{active.code}</span>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{active.name}</h2>
              <p style={{ color: 'var(--muted)' }}>{active.meaning}</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
                disabled={progress.masteredSigns.includes(active.id)}
                onClick={() => markSignMastered(active.id)}
              >
                {progress.masteredSigns.includes(active.id)
                  ? 'Jau išmokote'
                  : 'Pažymėti kaip išmoktą'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
