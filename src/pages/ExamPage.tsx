import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EXAM_MINUTES,
  EXAM_PASS_SCORE,
  EXAM_QUESTION_COUNT,
  pickExamQuestions,
} from '../data/questions';
import type { QuizQuestion } from '../data/types';
import { useContent } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';

function emptyAnswers(count: number): (number | null)[] {
  return Array.from({ length: count }, () => null);
}

export function ExamPage() {
  const { recordQuiz } = useProgress();
  const { questions } = useContent();
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    emptyAnswers(EXAM_QUESTION_COUNT),
  );
  const [secondsLeft, setSecondsLeft] = useState(EXAM_MINUTES * 60);
  const [done, setDone] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const score = useMemo(
    () =>
      answers.reduce<number>((n, a, i) => {
        if (a === null || !items[i]) return n;
        return n + (a === items[i].correctIndex ? 1 : 0);
      }, 0),
    [answers, items],
  );

  const unanswered = answers.filter((a) => a === null).length;

  const finish = useCallback(() => {
    if (done) return;
    setDone(true);
    const finalScore = answers.reduce<number>((n, a, i) => {
      if (a === null || !items[i]) return n;
      return n + (a === items[i].correctIndex ? 1 : 0);
    }, 0);
    recordQuiz(finalScore, items.length || EXAM_QUESTION_COUNT, 'exam');
  }, [answers, done, items, recordQuiz]);

  useEffect(() => {
    if (!started || done) return;
    if (secondsLeft <= 0) {
      finish();
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [started, done, secondsLeft, finish]);

  const startExam = () => {
    const next = pickExamQuestions(questions);
    setItems(next);
    setAnswers(emptyAnswers(next.length));
    setIndex(0);
    setSecondsLeft(EXAM_MINUTES * 60);
    setDone(false);
    setReviewOpen(false);
    setStarted(true);
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
            Klausimai parenkami atsitiktinai iš KET 2026 banko, atsakymų eilė maišoma. Laikmatis
            prasideda iškart. Galite grįžti prie ankstesnių klausimų.
          </p>
          <button className="btn btn-primary" onClick={startExam}>
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
        <button className="btn btn-ghost" onClick={() => setReviewOpen((v) => !v)}>
          {reviewOpen ? 'Slėpti paaiškinimus' : 'Peržiūrėti atsakymus ir paaiškinimus'}
        </button>
        {reviewOpen && (
          <div className="review-list" style={{ textAlign: 'left', marginTop: '1.25rem' }}>
            {items.map((item, i) => {
              const ok = answers[i] === item.correctIndex;
              return (
                <details key={item.id} className={`review-item${ok ? ' ok' : ' bad'}`}>
                  <summary>
                    {i + 1}. {ok ? 'Teisingai' : 'Neteisingai'} · {item.question}
                  </summary>
                  <p>
                    Jūsų atsakymas:{' '}
                    {answers[i] == null ? 'neatsakyta' : item.options[answers[i]]}
                  </p>
                  <p>Teisingas: {item.options[item.correctIndex]}</p>
                  <p className="muted">{item.explanation}</p>
                </details>
              );
            })}
          </div>
        )}
        <div className="quiz-actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={startExam}>
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
      <div className="exam-nav" aria-label="Klausimų numeriai">
        {items.map((_, i) => (
          <button
            key={i}
            className={`exam-dot${i === index ? ' current' : ''}${
              answers[i] !== null ? ' answered' : ''
            }`}
            onClick={() => setIndex(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <h2 className="question-text">{q.question}</h2>
      <div className="options">
        {q.options.map((opt, i) => (
          <button
            key={`${q.id}-${i}`}
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
          <button className="btn btn-primary" onClick={() => setIndex((i) => i + 1)}>
            Kitas
          </button>
        ) : (
          <button className="btn btn-primary" onClick={finish}>
            Baigti egzaminą
            {unanswered > 0 ? ` (${unanswered} be atsakymo)` : ''}
          </button>
        )}
      </div>
    </div>
  );
}
