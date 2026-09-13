import { useState } from 'react';
import type { QuizQuestion } from '../data/types';
import { useCards } from '../hooks/useCards';

export function AddQuestionCardsButton({
  questions,
  label = 'Įtraukti į korteles',
}: {
  questions: QuizQuestion[];
  label?: string;
}) {
  const { addQuestionCards, hasSource } = useCards();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = questions.filter((q) => !hasSource(`question-${q.id}`));

  if (!questions.length) return null;

  return (
    <div>
      <button
        className="btn btn-ghost"
        type="button"
        disabled={busy || pending.length === 0}
        onClick={async () => {
          setBusy(true);
          setMsg('');
          const r = await addQuestionCards(questions);
          setBusy(false);
          setMsg(
            r.added
              ? `Į kaladę įtraukta ${r.added} klausimų.`
              : 'Šie klausimai jau yra kortelėse.',
          );
        }}
      >
        {busy ? 'Kuriama…' : pending.length === 0 ? 'Jau kortelėse' : label}
      </button>
      {msg && (
        <p className="muted" style={{ margin: '0.5rem 0 0' }}>
          {msg}
        </p>
      )}
    </div>
  );
}
