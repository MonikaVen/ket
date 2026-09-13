import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SignVisual } from '../components/SignVisual';
import { chapters } from '../data/chapters';
import { signIdFromCard } from '../data/cards';
import { getQuestionsByChapter, shuffle } from '../data/questions';
import { signs } from '../data/signs';
import type { CardKind, ChapterId, ConceptCard } from '../data/types';
import { useAuth } from '../hooks/useAuth';
import { useCards } from '../hooks/useCards';
import { useContent } from '../hooks/useContent';
import { useProgress } from '../hooks/useProgress';

export function FlashcardsPage() {
  const { allCards, mine, addCard, addQuestionCards, addSignDescriptionCards, removeCard, hasSource } =
    useCards();
  const { questions } = useContent();
  const { markSignMastered, progress } = useProgress();
  const { user } = useAuth();
  const [filter, setFilter] = useState<CardKind | 'all'>('all');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [fromQuestions, setFromQuestions] = useState(true);
  const [fromSigns, setFromSigns] = useState(true);
  const [chapterId, setChapterId] = useState<ChapterId | 'all'>('all');
  const [busy, setBusy] = useState(false);
  const [genMsg, setGenMsg] = useState('');

  const questionPool = useMemo(
    () => (chapterId === 'all' ? questions : getQuestionsByChapter(chapterId, questions)),
    [chapterId, questions],
  );
  const newQuestionCount = questionPool.filter((q) => !hasSource(`question-${q.id}`)).length;
  const newSignCount = signs.filter((s) => !hasSource(`signdesc-${s.id}`)).length;

  const filtered = useMemo(
    () => (filter === 'all' ? allCards : allCards.filter((c) => c.kind === filter)),
    [allCards, filter],
  );
  const deck = useMemo(() => shuffle(filtered), [filtered]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = deck.length ? deck[i % deck.length] : undefined;

  const next = (mastered: boolean) => {
    if (mastered && card?.kind === 'sign') {
      const signId = signIdFromCard(card);
      if (signId) markSignMastered(signId);
    }
    setFlipped(false);
    if (!deck.length) return;
    setTimeout(() => setI((x) => (x + 1) % deck.length), 180);
  };

  const submitCard = async (e: FormEvent) => {
    e.preventDefault();
    await addCard({ front, back, kind: 'concept' });
    setFront('');
    setBack('');
    setShowForm(false);
  };

  const generate = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setGenMsg('');
    try {
      let added = 0;
      let skipped = 0;
      if (fromQuestions) {
        const r = await addQuestionCards(questionPool);
        added += r.added;
        skipped += r.skipped;
      }
      if (fromSigns) {
        const r = await addSignDescriptionCards(signs);
        added += r.added;
        skipped += r.skipped;
      }
      if (added === 0) {
        setGenMsg('Naujų kortelių nėra — visos pasirinktos jau kaladėje.');
      } else {
        setGenMsg(`Sukurta ${added} kortelių${skipped ? `, praleista ${skipped}` : ''}.`);
        setFilter(fromQuestions && !fromSigns ? 'question' : fromSigns && !fromQuestions ? 'sign' : 'all');
        setI(0);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Kartojimas</span>
          <h1>Mokymosi kortelės</h1>
          <p>
            Ženklai, klausimai ir jūsų sąvokos. {progress.masteredSigns.length}/{signs.length}{' '}
            ženklų išmokta.
            {!user && ' Prisijunkite, kad kortelės išsisaugotų paskyroje.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setShowGenerate((v) => !v);
              setShowForm(false);
            }}
          >
            {showGenerate ? 'Uždaryti' : 'Sukurti iš KET'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm((v) => !v);
              setShowGenerate(false);
            }}
          >
            {showForm ? 'Uždaryti' : 'Pridėti sąvoką'}
          </button>
        </div>
      </div>

      {showGenerate && (
        <form className="form-card" onSubmit={generate} style={{ marginBottom: '1.5rem' }}>
          <p className="muted" style={{ margin: 0 }}>
            Kortelės sudaromos automatiškai iš testų klausimų (priekis — klausimas, nugarėlė —
            teisingas atsakymas ir paaiškinimas) ir iš oficialių ženklų aprašymų.
          </p>
          <label className="check-row">
            <input
              type="checkbox"
              checked={fromQuestions}
              onChange={(e) => setFromQuestions(e.target.checked)}
            />
            Iš KET klausimų ({newQuestionCount} naujų iš {questionPool.length})
          </label>
          <label>
            Klausimų tema
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value as ChapterId | 'all')}
              disabled={!fromQuestions}
            >
              <option value="all">Visos temos</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={fromSigns} onChange={(e) => setFromSigns(e.target.checked)} />
            Iš ženklų aprašymų ({newSignCount} naujų iš {signs.length})
          </label>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={busy || (!fromQuestions && !fromSigns)}
          >
            {busy ? 'Kuriama…' : 'Sukurti korteles'}
          </button>
          {genMsg && <p className="muted">{genMsg}</p>}
        </form>
      )}

      {showForm && (
        <form className="form-card" onSubmit={submitCard} style={{ marginBottom: '1.5rem' }}>
          <label>
            Sąvoka / klausimas
            <input value={front} onChange={(e) => setFront(e.target.value)} required />
          </label>
          <label>
            Paaiškinimas
            <textarea value={back} onChange={(e) => setBack(e.target.value)} rows={3} required />
          </label>
          <button className="btn btn-primary" type="submit">
            Įtraukti į kaladę
          </button>
        </form>
      )}

      <div className="filters">
        {(
          [
            ['all', 'Visos'],
            ['sign', 'Ženklai'],
            ['question', 'Klausimai'],
            ['rule', 'Taisyklės'],
            ['concept', 'Sąvokos'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={`chip${filter === id ? ' active' : ''}`}
            onClick={() => {
              setFilter(id);
              setI(0);
              setFlipped(false);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {!card ? (
        <p className="empty">
          Šioje grupėje kortelių nėra.{' '}
          {filter === 'rule'
            ? 'Skyriuje spauskite „Į korteles“ prie taisyklės.'
            : filter === 'question'
              ? 'Spauskite „Sukurti iš KET“ ir pažymėkite klausimus.'
              : 'Pridėkite sąvoką arba sukurkite iš KET.'}
        </p>
      ) : (
        <div className="flash-stage">
          <FlashCardView card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} index={i} total={deck.length} />
          <div className="quiz-actions" style={{ justifyContent: 'center', marginTop: '1.25rem' }}>
            <button className="btn btn-ghost" onClick={() => next(false)}>
              Dar mokysiuosi
            </button>
            <button className="btn btn-primary" onClick={() => next(true)}>
              Moku
            </button>
            {mine.some((c) => c.id === card.id) && (
              <button className="btn btn-danger" onClick={() => void removeCard(card.id)}>
                Šalinti
              </button>
            )}
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <Link className="btn btn-ghost" to="/zenklai">
          Ženklų sąrašas
        </Link>
      </p>
    </div>
  );
}

function FlashCardView({
  card,
  flipped,
  onFlip,
  index,
  total,
}: {
  card: ConceptCard;
  flipped: boolean;
  onFlip: () => void;
  index: number;
  total: number;
}) {
  const signId = signIdFromCard(card);
  const sign = signId ? signs.find((s) => s.id === signId) : undefined;
  const fromDescription = card.kind === 'sign' && card.prompt === 'text';
  const prompt = fromDescription
    ? 'Koks tai ženklas?'
    : card.kind === 'question'
      ? 'Teisingas atsakymas?'
      : sign
        ? 'Kas tai per ženklas?'
        : 'Kas tai?';

  return (
    <button
      className={`flash-card${flipped ? ' flipped' : ''}`}
      onClick={onFlip}
      aria-label="Apversti kortelę"
    >
      <div className="flash-face">
        {sign && !fromDescription ? (
          <SignVisual sign={sign} className="sign-visual" />
        ) : (
          <h2 style={{ fontSize: '1.15rem', textAlign: 'center', whiteSpace: 'pre-wrap' }}>{card.front}</h2>
        )}
        <p>{prompt}</p>
        <span className="eyebrow" style={{ margin: 0 }}>
          {index + 1} / {total}
        </span>
      </div>
      <div className="flash-face back">
        {sign ? (
          <>
            {fromDescription && <SignVisual sign={sign} className="sign-visual" />}
            <h2>{sign.name}</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{fromDescription ? card.back : sign.meaning}</p>
            <span className="eyebrow" style={{ margin: 0 }}>
              Kodas {sign.code}
            </span>
          </>
        ) : (
          <>
            <h2>{card.kind === 'question' ? 'Atsakymas' : card.front}</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{card.back}</p>
          </>
        )}
      </div>
    </button>
  );
}
