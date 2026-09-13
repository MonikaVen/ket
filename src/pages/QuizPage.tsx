import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { chapters } from '../data/chapters';
import { getQuestionsByChapter, questions, shuffle, withShuffledOptions } from '../data/questions';
import type { ChapterId, QuizQuestion } from '../data/types';
import { useProgress } from '../hooks/useProgress';

export function QuizEngine({
  items,
  mode,
  chapterId,
  title,
  showExplanations = true,
}: {
  items: QuizQuestion[];
  mode: string;
  chapterId?: ChapterId;
  title: string;
  showExplanations?: boolean;
}) {
  const { recordQuiz } = useProgress();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => items.map(() => null));
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const q = items[index];
  const selected = answers[index];
  const score = answers.reduce<number>((n, a, i) => {
    if (a === null) return n;
    return n + (a === items[i].correctIndex ? 1 : 0);
  }, 0);
  const pct = Math.round(((index + (selected !== null ? 1 : 0)) / items.length) * 100);

  const choose = (i: number) => {
    if (revealed || answers[index] !== null) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = i;
      return next;
    });
    setRevealed(true);
  };

  const goTo = (nextIndex: number) => {
    setIndex(nextIndex);
    setRevealed(answers[nextIndex] !== null && showExplanations);
  };

  const finish = () => {
    const finalScore = answers.reduce<number>(
      (n, a, i) => n + (a === items[i].correctIndex ? 1 : 0),
      0,
    );
    recordQuiz(finalScore, items.length, mode, chapterId);
    setDone(true);
  };

  const next = () => {
    if (index + 1 >= items.length) {
      finish();
      return;
    }
    goTo(index + 1);
  };

  if (!items.length) {
    return (
      <div className="empty">
        <p>Šiai temai klausimų dar nėra. Pasirinkite kitą skyrių.</p>
        <Link className="btn btn-primary" to="/testas" style={{ marginTop: '1rem' }}>
          Atgal
        </Link>
      </div>
    );
  }

  if (done) {
    const passed = score / items.length >= 0.8;
    return (
      <div className="result-card">
        <span className="eyebrow">{passed ? 'Puiku' : 'Tęskite mokytis'}</span>
        <div className="score">
          {score}/{items.length}
        </div>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
          {passed
            ? 'Pasiekėte 80 %+ — Regitros egzamino ribą.'
            : 'Reikia bent 80 %. Peržiūrėkite temas ir bandykite dar kartą.'}
        </p>
        <div className="review-list">
          {items.map((item, i) => {
            const ok = answers[i] === item.correctIndex;
            return (
              <details key={item.id} className={`review-item${ok ? ' ok' : ' bad'}`}>
                <summary>
                  {ok ? 'Teisingai' : 'Neteisingai'} · {item.question}
                </summary>
                <p>
                  Jūsų atsakymas: {answers[i] == null ? '—' : item.options[answers[i]]}
                </p>
                <p>Teisingas: {item.options[item.correctIndex]}</p>
                <p className="muted">{item.explanation}</p>
              </details>
            );
          })}
        </div>
        <div className="quiz-actions" style={{ justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              setIndex(0);
              setAnswers(items.map(() => null));
              setRevealed(false);
              setDone(false);
            }}
          >
            Kartoti
          </button>
          <Link className="btn btn-ghost" to="/mokytis">
            Mokytis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-panel">
      <div className="section-head" style={{ marginBottom: '1rem' }}>
        <div>
          <span className="eyebrow">{title}</span>
          <h1 style={{ fontSize: '1.6rem' }}>Klausimas {index + 1}</h1>
        </div>
      </div>
      <div className="quiz-progress">
        <span>
          {index + 1} / {items.length}
        </span>
        <span>Teisingai: {score}</span>
      </div>
      <div className="progress-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
      <h2 className="question-text">{q.question}</h2>
      <div className="options">
        {q.options.map((opt, i) => {
          let cls = 'option';
          if (revealed && showExplanations) {
            if (i === q.correctIndex) cls += ' correct';
            else if (i === selected) cls += ' wrong';
          } else if (selected === i) cls += ' selected';
          return (
            <button
              key={`${q.id}-${i}`}
              className={cls}
              disabled={selected !== null}
              onClick={() => choose(i)}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && showExplanations && (
        <div className="feedback">
          <strong>{selected === q.correctIndex ? 'Teisingai. ' : 'Neteisingai. '}</strong>
          {q.explanation}
        </div>
      )}
      <div className="quiz-actions">
        <button className="btn btn-ghost" disabled={index === 0} onClick={() => goTo(index - 1)}>
          Atgal
        </button>
        <button className="btn btn-primary" disabled={selected === null} onClick={next}>
          {index + 1 >= items.length ? 'Rezultatas' : 'Kitas'}
        </button>
      </div>
    </div>
  );
}

export function QuizPage() {
  const [params] = useSearchParams();
  const tema = params.get('tema') as ChapterId | null;
  const [picked, setPicked] = useState<ChapterId | 'all'>(tema ?? 'all');

  const items = useMemo(() => {
    const pool = picked === 'all' ? questions : getQuestionsByChapter(picked);
    return shuffle(pool)
      .slice(0, Math.min(10, pool.length))
      .map(withShuffledOptions);
  }, [picked]);

  const key = `${picked}-${items[0]?.id ?? 'empty'}-${items.length}`;

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Praktika</span>
          <h1>Teminis testas</h1>
          <p>10 klausimų su paaiškinimais. Pasirinkite temą arba mišrų rinkinį.</p>
        </div>
      </div>

      <div className="filters">
        <button
          className={`chip${picked === 'all' ? ' active' : ''}`}
          onClick={() => setPicked('all')}
        >
          Visos temos
        </button>
        {chapters.map((c) => (
          <button
            key={c.id}
            className={`chip${picked === c.id ? ' active' : ''}`}
            onClick={() => setPicked(c.id)}
          >
            {c.title}
          </button>
        ))}
      </div>

      <QuizEngine
        key={key}
        items={items}
        mode="practice"
        chapterId={picked === 'all' ? undefined : picked}
        title="Praktikos testas"
      />
    </div>
  );
}
