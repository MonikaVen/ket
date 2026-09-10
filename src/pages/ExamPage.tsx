import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EXAM_MINUTES,
  EXAM_PASS_SCORE,
  EXAM_QUESTION_COUNT,
  pickExamQuestions,
} from '../data/questions';
import { useProgress } from '../hooks/useProgress';

export function ExamPage() {
  const { recordQuiz } = useProgress();
  const [started, setStarted] = useState(false);
  const [items] = useState(() => pickExamQuestions());
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(EXAM_QUESTION_COUNT).fill(null),
  );
  const [secondsLeft, setSecondsLeft] = useState(EXAM_MINUTES * 60);
  const [done, setDone] = useState(false);

  const score = useMemo(
    () =>
      answers.reduce<number>((n, a, i) => {
        if (a === null || !items[i]) return n;
        return n + (a === items[i].correctIndex ? 1 : 0);
      }, 0),
    [answers, items],
  );

  useEffect(() => {
    if (!started || done) return;
    if (secondsLeft <= 0) {
      finish();
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, done, secondsLeft]);

  const finish = () => {
    if (done) return;
    setDone(true);
    const finalScore = answers.reduce<number>((n, a, i) => {
      if (a === null || !items[i]) return n;
      return n + (a === items[i].correctIndex ? 1 : 0);
    }, 0);
    recordQuiz(finalScore, items.length, 'exam');
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  if (!started) {
    return (
      <div>
        <div className="section-head">
          <div>
            <span className="eyebrow">Regitra</span>
            <h1>Teorijos egzaminas</h1>
            <p>
              {EXAM_QUESTION_COUNT} klausimų · {EXAM_MINUTES} minučių · išlaikyti reikia{' '}
              {EXAM_PASS_SCORE}/{EXAM_QUESTION_COUNT}. Paaiškinimai rodomi tik pabaigoje.
            </p>
          </div>
        </div>
        <div className="result-card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
            Klausimai parenkami atsitiktinai iš KET 2026 banko. Laikmatis prasideda iškart.
          </p>
          <button className="btn btn-primary" onClick={() => setStarted(true)}>
            Pradėti egzaminą
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    const passed = score >= EXAM_PASS_SCORE;
    return (
      <div className="result-card">
        <span className="eyebrow">{passed ? 'Išlaikyta' : 'Neišlaikyta'}</span>
        <div className="score" style={{ color: passed ? 'var(--success)' : 'var(--danger)' }}>
          {score}/{items.length}
        </div>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
          {passed
            ? 'Sveikiname — pasiekėte Regitros išlaikymo ribą.'
            : `Reikia bent ${EXAM_PASS_SCORE} teisingų. Grįžkite prie silpnų temų.`}
        </p>
        <div className="quiz-actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Naujas egzaminas
          </button>
          <Link className="btn btn-ghost" to="/pazanga">
            Pažanga
          </Link>
        </div>
      </div>
    );
  }

  const q = items[index];

  return (
    <div className="quiz-panel">
      <div className="quiz-progress">
        <span>
          Klausimas {index + 1} / {items.length}
        </span>
        <span className="timer">
          {mm}:{ss}
        </span>
      </div>
      <div className="progress-bar">
        <span style={{ width: `${((index + 1) / items.length) * 100}%` }} />
      </div>
      <h2 className="question-text">{q.question}</h2>
      <div className="options">
        {q.options.map((opt, i) => (
          <button
            key={opt}
            className={`option${answers[index] === i ? ' selected' : ''}`}
            onClick={() =>
              setAnswers((prev) => {
                const next = [...prev];
                next[index] = i;
                return next;
              })
            }
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="quiz-actions">
        <button
          className="btn btn-ghost"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Atgal
        </button>
        {index + 1 < items.length ? (
          <button
            className="btn btn-primary"
            disabled={answers[index] === null}
            onClick={() => setIndex((i) => i + 1)}
          >
            Kitas
          </button>
        ) : (
          <button
            className="btn btn-primary"
            disabled={answers[index] === null}
            onClick={finish}
          >
            Baigti egzaminą
          </button>
        )}
      </div>
    </div>
  );
}
