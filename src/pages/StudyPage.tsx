import { Link } from 'react-router-dom';
import { chapters } from '../data/chapters';
import { useProgress } from '../hooks/useProgress';

export function StudyPage() {
  const { progress } = useProgress();

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Turinys</span>
          <h1>Mokytis pagal skyrius</h1>
          <p>Pasirinkite skyrių, skaitykite taisykles ir pažymėkite, ką jau išmokote.</p>
        </div>
        <a
          className="btn btn-ghost"
          href="https://www.ketonline.lt/wp-content/uploads/2026/02/Keliu-eismo-taisykles-KET-su-paveiksliukais-2026-01-01.pdf"
          target="_blank"
          rel="noreferrer"
        >
          Atidaryti KET PDF
        </a>
      </div>

      <div className="grid-chapters">
        {chapters.map((ch, i) => {
          const studied = ch.rules.filter((r) => progress.studiedRules.includes(r.id)).length;
          return (
            <Link
              key={ch.id}
              to={`/mokytis/${ch.id}`}
              className="chapter-tile"
              style={{ ['--tile-color' as string]: ch.color, animationDelay: `${i * 0.04}s` }}
            >
              <div className="roman">Skyrius {ch.roman}</div>
              <h3>{ch.title}</h3>
              <p>{ch.summary}</p>
              <div className="meta">
                {ch.rules.length} taisyklių · išmokta {studied}/{ch.rules.length}
                {progress.chapterScores[ch.id] != null &&
                  ` · testas ${progress.chapterScores[ch.id]}%`}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
