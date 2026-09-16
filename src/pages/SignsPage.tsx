import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SignVisual } from '../components/SignVisual';
import { signCategories, signs } from '../data/signs';
import type { SignCategory } from '../data/types';
import { useCards } from '../hooks/useCards';
import { useProgress } from '../hooks/useProgress';

export function SignsPage() {
  const [cat, setCat] = useState<SignCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const { progress, markSignMastered } = useProgress();
  const { addSignCard, hasSource } = useCards();
  const detailRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return signs.filter((s) => {
      if (cat !== 'all' && s.category !== cat) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.includes(q) ||
        s.meaning.toLowerCase().includes(q)
      );
    });
  }, [cat, query]);
  const active = signs.find((s) => s.id === activeId) ?? null;

  useEffect(() => {
    if (!activeId) return;
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeId]);

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">1 priedas</span>
          <h1>Kelio ženklai</h1>
          <p>
            Oficialūs KET 2026 numeriai; pavyzdžiai nukirpti iš 1 priedo. Pažymėkite išmoktus ir
            kartokite kortelėmis.
          </p>
        </div>
        <Link className="btn btn-primary" to="/korteles">
          Kortelės
        </Link>
      </div>

      <label className="search-field">
        <span className="sr-only">Ieškoti ženklo</span>
        <input
          type="search"
          placeholder="Ieškoti pagal pavadinimą ar numerį (pvz. 203)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

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

      {active && (
        <div className="detail-panel" ref={detailRef}>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <SignVisual sign={active} className="sign-visual" />
            <div style={{ flex: 1, minWidth: 220 }}>
              <span className="eyebrow">{active.code}</span>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{active.name}</h2>
              <p style={{ color: 'var(--muted)' }}>{active.meaning}</p>
              <div className="quiz-actions" style={{ marginTop: '1rem' }}>
                <button
                  className="btn btn-primary"
                  disabled={progress.masteredSigns.includes(active.id)}
                  onClick={() => markSignMastered(active.id)}
                >
                  {progress.masteredSigns.includes(active.id)
                    ? 'Jau išmokote'
                    : 'Pažymėti kaip išmoktą'}
                </button>
                <button
                  className={`btn ${hasSource(active.id) ? 'btn-ghost' : 'btn-primary'}`}
                  type="button"
                  disabled={hasSource(active.id)}
                  onClick={() => void addSignCard(active.id)}
                >
                  {hasSource(active.id) ? 'Jau kaladėje' : 'Pridėti kortelę'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
      {filtered.length === 0 && <p className="empty">Nerasta ženklų pagal paiešką.</p>}
    </div>
  );
}
