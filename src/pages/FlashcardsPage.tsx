import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SignVisual } from '../components/SignVisual';
import { signs } from '../data/signs';
import { shuffle } from '../data/questions';
import { useProgress } from '../hooks/useProgress';

export function FlashcardsPage() {
  const deck = useMemo(() => shuffle(signs), []);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { markSignMastered, progress } = useProgress();
  const sign = deck[i];

  const next = (mastered: boolean) => {
    if (mastered) markSignMastered(sign.id);
    setFlipped(false);
    setTimeout(() => setI((x) => (x + 1) % deck.length), 180);
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Kartojimas</span>
          <h1>Ženklų kortelės</h1>
          <p>
            Spustelėkite kortelę, kad pamatytumėte atsakymą. {progress.masteredSigns.length}/
            {signs.length} išmokta.
          </p>
        </div>
        <Link className="btn btn-ghost" to="/zenklai">
          Ženklų sąrašas
        </Link>
      </div>

      <div className="flash-stage">
        <button
          className={`flash-card${flipped ? ' flipped' : ''}`}
          onClick={() => setFlipped((f) => !f)}
          aria-label="Apversti kortelę"
        >
          <div className="flash-face">
            <div style={{ width: 120, height: 120 }}>
              <SignVisual sign={sign} className="sign-visual" />
            </div>
            <p>Kas tai per ženklas?</p>
            <span className="eyebrow" style={{ margin: 0 }}>
              {i + 1} / {deck.length}
            </span>
          </div>
          <div className="flash-face back">
            <h2>{sign.name}</h2>
            <p>{sign.meaning}</p>
            <span className="eyebrow" style={{ margin: 0 }}>
              Kodas {sign.code}
            </span>
          </div>
        </button>

        <div className="quiz-actions" style={{ justifyContent: 'center', marginTop: '1.25rem' }}>
          <button className="btn btn-ghost" onClick={() => next(false)}>
            Dar mokysiuosi
          </button>
          <button className="btn btn-primary" onClick={() => next(true)}>
            Moku
          </button>
        </div>
      </div>
    </div>
  );
}
