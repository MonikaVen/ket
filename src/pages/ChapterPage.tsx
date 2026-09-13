import { Link, useParams } from 'react-router-dom';
import { getChapter } from '../data/chapters';
import { getQuestionsForRule } from '../data/questions';
import { useCards } from '../hooks/useCards';
import { useContent } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';

export function ChapterPage() {
  const { chapterId } = useParams();
  const chapter = getChapter(chapterId ?? '');
  const { progress, markRuleStudied } = useProgress();
  const { addRuleCard, mine } = useCards();
  const { questions } = useContent();

  if (!chapter) {
    return (
      <div>
        <h1>Skyrius nerastas</h1>
        <Link className="btn btn-primary" to="/mokytis" style={{ marginTop: '1rem' }}>
          Grįžti
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Skyrius {chapter.roman}</span>
          <h1>{chapter.title}</h1>
          <p>{chapter.summary}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-ghost" to="/mokytis">
            Visi skyriai
          </Link>
          <Link className="btn btn-primary" to={`/testas?tema=${chapter.id}`}>
            Testuoti temą
          </Link>
        </div>
      </div>

      <div className="rule-list">
        {chapter.rules.map((rule, i) => {
          const studied = progress.studiedRules.includes(rule.id);
          const inDeck = mine.some((c) => c.sourceId === rule.id || c.id === `rule-${rule.id}`);
          const qCount = getQuestionsForRule(rule.id, questions).length;
          return (
            <article
              key={rule.id}
              className={`rule-card${studied ? ' studied' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="rule-top">
                <span className="rule-num">§ {rule.number}</span>
                <h3>{rule.title}</h3>
              </div>
              <p className="body">{rule.text}</p>
              {rule.tip && <p className="tip">Patarimas: {rule.tip}</p>}
              <p className="muted" style={{ marginTop: '0.65rem', fontSize: '0.85rem' }}>
                Klausimų testuose: {qCount}
              </p>
              <div className="quiz-actions" style={{ marginTop: '1rem' }}>
                <button
                  className={`btn ${studied ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => markRuleStudied(rule.id)}
                  disabled={studied}
                >
                  {studied ? 'Išmokta' : 'Pažymėti kaip išmoktą'}
                </button>
                <button
                  className="btn btn-ghost"
                  disabled={inDeck}
                  onClick={() => void addRuleCard(rule.id)}
                >
                  {inDeck ? 'Jau kortelėse' : 'Į korteles'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
