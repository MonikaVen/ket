import { Link } from 'react-router-dom';
import { chapters } from '../data/chapters';
import { signs } from '../data/signs';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';

export function ProgressPage() {
  const { progress, studiedPct, totalRules, resetProgress } = useProgress();
  const { user } = useAuth();
  const examAttempts = progress.quizHistory.filter((h) => h.mode === 'exam');
  const bestExam = examAttempts.reduce(
    (best, h) => Math.max(best, Math.round((h.score / h.total) * 100)),
    0,
  );

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Statistika</span>
          <h1>Jūsų pažanga</h1>
          <p>
            {user
              ? 'Pažanga saugoma jūsų paskyroje ir šiame įrenginyje.'
              : 'Be paskyros duomenys lieka šiame įrenginyje. Registracija išsaugo istoriją serveryje.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {!user && (
            <Link className="btn btn-primary" to="/paskyra">
              Registruotis
            </Link>
          )}
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm('Ištrinti visą pažangą šiame įrenginyje?')) resetProgress();
            }}
          >
            Nunulinti
          </button>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="label">Taisyklės</div>
          <div className="value">{studiedPct}%</div>
          <div className="label">
            {progress.studiedRules.length}/{totalRules}
          </div>
        </div>
        <div className="stat">
          <div className="label">Ženklai</div>
          <div className="value">
            {progress.masteredSigns.length}/{signs.length}
          </div>
        </div>
        <div className="stat">
          <div className="label">Serija</div>
          <div className="value">{progress.streak} d.</div>
        </div>
        <div className="stat">
          <div className="label">Geriausias egzaminas</div>
          <div className="value">{examAttempts.length ? `${bestExam}%` : '—'}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.85rem' }}>Skyrių testai</h2>
      <div className="grid-chapters" style={{ marginBottom: '2rem' }}>
        {chapters.map((ch) => (
          <Link
            key={ch.id}
            to={`/testas?tema=${ch.id}`}
            className="chapter-tile"
            style={{ ['--tile-color' as string]: ch.color }}
          >
            <div className="roman">{ch.roman}</div>
            <h3>{ch.title}</h3>
            <div className="meta">
              {progress.chapterScores[ch.id] != null
                ? `Geriausias: ${progress.chapterScores[ch.id]}%`
                : 'Dar netestuota'}
            </div>
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.85rem' }}>Istorija</h2>
      {progress.quizHistory.length === 0 ? (
        <p className="empty">Dar nėra bandymų. Išbandykite testą arba egzaminą.</p>
      ) : (
        <div className="history-list">
          {progress.quizHistory.map((h, idx) => (
            <div key={`${h.date}-${idx}`} className="history-item">
              <span>
                {h.mode === 'exam' ? 'Egzaminas' : 'Testas'} · {h.score}/{h.total}
              </span>
              <span className="muted">{h.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
