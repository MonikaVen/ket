import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SignVisual } from '../components/SignVisual';
import { signs } from '../data/signs';
import { shuffle } from '../data/questions';
import type { CardKind, ConceptCard } from '../data/types';
import { useAuth } from '../hooks/useAuth';
import { useCards } from '../hooks/useCards';
import { useProgress } from '../hooks/useProgress';

const LEARNED_KEY = 'ket-mokykla-deck-learned-v1';

const kindLabel: Record<CardKind, string> = {
  sign: 'Ženklas',
  rule: 'Taisyklė',
  concept: 'Sąvoka',
};

function loadLearned(): Set<string> {
  try {
    const raw = localStorage.getItem(LEARNED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveLearned(ids: Set<string>) {
  localStorage.setItem(LEARNED_KEY, JSON.stringify([...ids]));
}

export function FlashcardsPage() {
  const { allCards, mine, addCard, removeCard } = useCards();
  const { markSignMastered, markRuleStudied, progress } = useProgress();
  const { user } = useAuth();
  const [filter, setFilter] = useState<CardKind | 'all'>('all');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [order, setOrder] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [learnedIds, setLearnedIds] = useState<Set<string>>(loadLearned);
  const [shufflePulse, setShufflePulse] = useState(0);

  const counts = useMemo(
    () => ({
      all: allCards.length,
      sign: allCards.filter((c) => c.kind === 'sign').length,
      rule: allCards.filter((c) => c.kind === 'rule').length,
      concept: allCards.filter((c) => c.kind === 'concept').length,
    }),
    [allCards],
  );

  useEffect(() => {
    setOrder((prev) => {
      const ids = allCards.map((c) => c.id);
      const idSet = new Set(ids);
      const kept = prev.filter((id) => idSet.has(id));
      const keptSet = new Set(kept);
      const added = ids.filter((id) => !keptSet.has(id));
      return [...added, ...kept];
    });
  }, [allCards]);

  const tableCards = useMemo(() => {
    const byId = new Map(allCards.map((c) => [c.id, c]));
    return order
      .map((id) => byId.get(id))
      .filter((c): c is ConceptCard => {
        if (!c) return false;
        return filter === 'all' || c.kind === filter;
      });
  }, [order, allCards, filter]);

  const openCard = tableCards.find((c) => c.id === openId) ?? allCards.find((c) => c.id === openId);
  const learnedCount = tableCards.filter((c) => learnedIds.has(c.id)).length;

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenId(null);
        setFlipped(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openId]);

  const closeOpen = () => {
    setOpenId(null);
    setFlipped(false);
  };

  const openCardAt = (id: string) => {
    setOpenId(id);
    setFlipped(false);
  };

  const reshuffle = () => {
    const shuffled = shuffle(tableCards).map((c) => c.id);
    const shuffledSet = new Set(shuffled);
    setOrder((prev) => [...shuffled, ...prev.filter((id) => !shuffledSet.has(id))]);
    setShufflePulse((n) => n + 1);
    closeOpen();
  };

  const markLearned = () => {
    if (!openCard) return;
    setLearnedIds((prev) => {
      const next = new Set(prev);
      next.add(openCard.id);
      saveLearned(next);
      return next;
    });
    if (openCard.kind === 'sign' && openCard.sourceId) markSignMastered(openCard.sourceId);
    if (openCard.kind === 'rule' && openCard.sourceId) markRuleStudied(openCard.sourceId);
    closeOpen();
  };

  const submitCard = async (e: FormEvent) => {
    e.preventDefault();
    const created = await addCard({ front, back, kind: 'concept' });
    setFront('');
    setBack('');
    setShowForm(false);
    setFilter('concept');
    openCardAt(created.id);
  };

  const removeOpen = async () => {
    if (!openCard) return;
    const id = openCard.id;
    closeOpen();
    setLearnedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveLearned(next);
      return next;
    });
    await removeCard(id);
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Kartojimas</span>
          <h1>Mokymosi kortelės</h1>
          <p>
            Kaladė ant stalo — visos kortelės užverstos. Atidarykite, perskaitykite, tada pažymėkite
            kaip išmoktą arba uždarykite. {progress.masteredSigns.length}/{signs.length} ženklų
            išmokta.
            {!user && ' Prisijunkite, kad kortelės išsisaugotų paskyroje.'}
          </p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Uždaryti formą' : 'Pridėti sąvoką'}
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
            type="button"
            className={`chip${filter === id ? ' active' : ''}`}
            onClick={() => {
              setFilter(id);
              closeOpen();
            }}
          >
            {label} ({counts[id]})
          </button>
        ))}
      </div>

      <div className="card-table">
        <div className="card-table-toolbar">
          <p>
            {tableCards.length
              ? `${tableCards.length} kortelės ant stalo · ${learnedCount} išmokta`
              : 'Kaladė tuščia'}
          </p>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={reshuffle}
            disabled={tableCards.length < 2}
          >
            Permaišyti
          </button>
        </div>

        {tableCards.length === 0 ? (
          <div className="deck-empty">
            <div className="deck-ghosts" aria-hidden="true">
              <span className="deck-back ghost" />
              <span className="deck-back ghost" />
              <span className="deck-back ghost" />
            </div>
            <p>
              {filter === 'all'
                ? 'Skyriuje spauskite „Pridėti kortelę“, kad taisyklė patektų į kaladę.'
                : 'Šioje grupėje kortelių nėra.'}
            </p>
            <p className="quiz-actions" style={{ justifyContent: 'center', marginTop: '0.75rem' }}>
              <Link className="btn btn-primary" to="/mokytis">
                Eiti mokytis
              </Link>
              {filter !== 'all' && (
                <button className="btn btn-ghost" type="button" onClick={() => setFilter('all')}>
                  Rodyti visas
                </button>
              )}
            </p>
          </div>
        ) : (
          <div className="deck-grid" key={shufflePulse}>
            {tableCards.map((card, i) => (
              <button
                key={card.id}
                type="button"
                className={`deck-back${learnedIds.has(card.id) ? ' learned' : ''}${
                  openId === card.id ? ' active' : ''
                }`}
                style={{ ['--tilt' as string]: `${((i * 17) % 7) - 3}deg` }}
                onClick={() => openCardAt(card.id)}
                aria-label={`Atidaryti kortelę: ${kindLabel[card.kind]}`}
              >
                <span className="deck-back-mark">K</span>
                <span className="deck-back-kind">{kindLabel[card.kind]}</span>
                {learnedIds.has(card.id) && <span className="deck-learned-badge">Išmokta</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {openCard && (
        <div
          className="deck-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Atidaryta kortelė"
          onClick={closeOpen}
        >
          <div className="deck-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flash-stage">
              <FlashCardView
                card={openCard}
                flipped={flipped}
                onFlip={() => setFlipped((f) => !f)}
              />
            </div>
            <p className="muted" style={{ textAlign: 'center', marginTop: '0.85rem' }}>
              {flipped ? 'Spustelėkite kortelę, kad užverstumėte.' : 'Spustelėkite kortelę, kad pamatytumėte atsakymą.'}
            </p>
            <div className="quiz-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-ghost" type="button" onClick={closeOpen}>
                Uždaryti
              </button>
              <button className="btn btn-primary" type="button" onClick={markLearned}>
                Išmokta
              </button>
              {mine.some((c) => c.id === openCard.id) && (
                <button className="btn btn-danger" type="button" onClick={() => void removeOpen()}>
                  Šalinti
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FlashCardView({
  card,
  flipped,
  onFlip,
}: {
  card: ConceptCard;
  flipped: boolean;
  onFlip: () => void;
}) {
  const sign = card.kind === 'sign' ? signs.find((s) => s.id === card.sourceId) : undefined;
  return (
    <button
      type="button"
      className={`flash-card${flipped ? ' flipped' : ''}`}
      onClick={onFlip}
      aria-label="Apversti kortelę"
    >
      <div className="flash-sizer" aria-hidden="true">
        <div className="flash-sizer-face">
          <FlashFaceFront card={card} sign={sign} />
        </div>
        <div className="flash-sizer-face">
          <FlashFaceBack card={card} sign={sign} />
        </div>
      </div>
      <div className="flash-face">
        <FlashFaceFront card={card} sign={sign} />
      </div>
      <div className="flash-face back">
        <FlashFaceBack card={card} sign={sign} />
      </div>
    </button>
  );
}

function FlashFaceFront({
  card,
  sign,
}: {
  card: ConceptCard;
  sign: (typeof signs)[number] | undefined;
}) {
  return (
    <>
      {sign ? <SignVisual sign={sign} className="sign-visual" /> : <h2>{card.front}</h2>}
      <p>{sign ? 'Kas tai per ženklas?' : 'Kas tai?'}</p>
      <span className="eyebrow" style={{ margin: 0 }}>
        {kindLabel[card.kind]}
      </span>
    </>
  );
}

function FlashFaceBack({
  card,
  sign,
}: {
  card: ConceptCard;
  sign: (typeof signs)[number] | undefined;
}) {
  if (sign) {
    return (
      <>
        <h2>{sign.name}</h2>
        <p>{sign.meaning}</p>
        <span className="eyebrow" style={{ margin: 0 }}>
          Kodas {sign.code}
        </span>
      </>
    );
  }
  return (
    <>
      <h2>{card.front}</h2>
      <p>{card.back}</p>
    </>
  );
}
