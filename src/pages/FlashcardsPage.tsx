import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SignVisual } from '../components/SignVisual';
import { signs } from '../data/signs';
import { shuffle } from '../data/questions';
import type { CardKind, ConceptCard } from '../data/types';
import { useAuth } from '../hooks/useAuth';
import { useCards } from '../hooks/useCards';
import { useProgress } from '../hooks/useProgress';

export function FlashcardsPage() {
  const { allCards, mine, addCard, removeCard } = useCards();
  const { markSignMastered, progress } = useProgress();
  const { user } = useAuth();
  const [filter, setFilter] = useState<CardKind | 'all'>('all');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(
    () => (filter === 'all' ? allCards : allCards.filter((c) => c.kind === filter)),
    [allCards, filter],
  );
  const deck = useMemo(() => shuffle(filtered), [filtered]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = deck.length ? deck[i % deck.length] : undefined;

  const next = (mastered: boolean) => {
    if (mastered && card?.kind === 'sign' && card.sourceId) markSignMastered(card.sourceId);
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

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Kartojimas</span>
          <h1>Mokymosi kortelės</h1>
          <p>
            Ženklai, taisyklės ir jūsų sąvokos. {progress.masteredSigns.length}/{signs.length}{' '}
            ženklų išmokta.
            {!user && ' Prisijunkite, kad kortelės išsisaugotų paskyroje.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Uždaryti' : 'Pridėti sąvoką'}
        </button>
      </div>

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
          {filter === 'rule' ? 'Skyriuje spauskite „Į korteles“ prie taisyklės.' : 'Pridėkite sąvoką.'}
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
  const sign = card.kind === 'sign' ? signs.find((s) => s.id === card.sourceId) : undefined;
  return (
    <button
      className={`flash-card${flipped ? ' flipped' : ''}`}
      onClick={onFlip}
      aria-label="Apversti kortelę"
    >
      <div className="flash-face">
        {sign ? (
          <SignVisual sign={sign} className="sign-visual" />
        ) : (
          <h2 style={{ fontSize: '1.25rem', textAlign: 'center' }}>{card.front}</h2>
        )}
        <p>{sign ? 'Kas tai per ženklas?' : 'Kas tai?'}</p>
        <span className="eyebrow" style={{ margin: 0 }}>
          {index + 1} / {total}
        </span>
      </div>
      <div className="flash-face back">
        {sign ? (
          <>
            <h2>{sign.name}</h2>
            <p>{sign.meaning}</p>
            <span className="eyebrow" style={{ margin: 0 }}>
              Kodas {sign.code}
            </span>
          </>
        ) : (
          <>
            <h2>{card.front}</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{card.back}</p>
          </>
        )}
      </div>
    </button>
  );
}
