import { useMemo, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api/client';
import { chapters } from '../data/chapters';
import { getQuestionsForRule } from '../data/questions';
import type { ChapterId, QuizQuestion } from '../data/types';
import { useAuth } from '../hooks/useAuth';
import { useContent } from '../hooks/useContent';

type Tab = 'coverage' | 'questions' | 'cards' | 'users';

export function AdminPage() {
  const { user, ready } = useAuth();
  const { questions, globalCards, reload } = useContent();
  const [tab, setTab] = useState<Tab>('coverage');
  const [users, setUsers] = useState<
    { id: string; email: string; name: string; role: string; createdAt: string; cardCount: number }[]
  >([]);
  const [error, setError] = useState('');

  const coverage = useMemo(() => {
    return chapters.flatMap((ch) =>
      ch.rules.map((rule) => ({
        chapter: ch.title,
        rule,
        count: getQuestionsForRule(rule.id, questions).length,
      })),
    );
  }, [questions]);

  const missing = coverage.filter((c) => c.count === 0);

  if (!ready) return <p className="muted">Kraunama…</p>;
  if (!user) return <Navigate to="/paskyra" replace />;
  if (user.role !== 'admin') {
    return (
      <div>
        <h1>Admin</h1>
        <p className="muted">Šis skyrius skirtas tik administratoriams.</p>
      </div>
    );
  }

  const loadUsers = async () => {
    const data = await api<{ users: typeof users }>('/admin/users');
    setUsers(data.users);
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="eyebrow">Valdymas</span>
          <h1>Administratoriaus skydelis</h1>
          <p>
            Turinys (skyriai, ženklai, testai) matomas visiems be prisijungimo. Čia pildote klausimus
            ir viešas korteles.
          </p>
        </div>
      </div>

      <div className="filters">
        {(
          [
            ['coverage', 'Padengimas'],
            ['questions', 'Klausimai'],
            ['cards', 'Kortelės'],
            ['users', 'Vartotojai'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={`chip${tab === id ? ' active' : ''}`}
            onClick={() => {
              setTab(id);
              if (id === 'users') void loadUsers().catch((e) => setError(String(e.message)));
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      {tab === 'coverage' && (
        <div className="admin-table-wrap">
          <p className="muted" style={{ marginBottom: '0.85rem' }}>
            {missing.length
              ? `Trūksta klausimų: ${missing.length} taisyklėms.`
              : 'Kiekviena taisyklė turi bent vieną klausimą.'}
          </p>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Skyrius</th>
                <th>Taisyklė</th>
                <th>Klausimų</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((row) => (
                <tr key={row.rule.id} className={row.count === 0 ? 'bad-row' : ''}>
                  <td>{row.chapter}</td>
                  <td>
                    § {row.rule.number} {row.rule.title}
                  </td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'questions' && (
        <QuestionForm
          onSaved={() => {
            reload();
          }}
          extra={questions.filter((q) => q.id.startsWith('aq-'))}
        />
      )}

      {tab === 'cards' && (
        <AdminCards
          cards={globalCards}
          onChange={() => {
            reload();
          }}
        />
      )}

      {tab === 'users' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Vardas</th>
                <th>El. paštas</th>
                <th>Rolė</th>
                <th>Kortelės</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.cardCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuestionForm({
  onSaved,
  extra,
}: {
  onSaved: () => void;
  extra: QuizQuestion[];
}) {
  const [chapterId, setChapterId] = useState<ChapterId>(chapters[0].id);
  const [ruleId, setRuleId] = useState(chapters[0].rules[0]?.id ?? '');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [msg, setMsg] = useState('');

  const rules = chapters.find((c) => c.id === chapterId)?.rules ?? [];

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setMsg('');
    await api('/admin/questions', {
      method: 'POST',
      body: JSON.stringify({
        question: {
          chapterId,
          ruleId,
          question,
          options: options.filter((o) => o.trim()),
          correctIndex,
          explanation,
        },
      }),
    });
    setQuestion('');
    setExplanation('');
    setOptions(['', '', '', '']);
    setMsg('Išsaugota. Klausimas matomas testuose be prisijungimo.');
    onSaved();
  };

  return (
    <div>
      <form className="form-card" onSubmit={save}>
        <label>
          Skyrius
          <select
            value={chapterId}
            onChange={(e) => {
              const id = e.target.value as ChapterId;
              setChapterId(id);
              setRuleId(chapters.find((c) => c.id === id)?.rules[0]?.id ?? '');
            }}
          >
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Taisyklė
          <select value={ruleId} onChange={(e) => setRuleId(e.target.value)}>
            {rules.map((r) => (
              <option key={r.id} value={r.id}>
                § {r.number} {r.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Klausimas
          <input value={question} onChange={(e) => setQuestion(e.target.value)} required />
        </label>
        {options.map((opt, i) => (
          <label key={i}>
            Atsakymas {i + 1}
            {i === 0 ? ' (teisingas pagal indeksą žemiau)' : ''}
            <input
              value={opt}
              onChange={(e) =>
                setOptions((prev) => {
                  const next = [...prev];
                  next[i] = e.target.value;
                  return next;
                })
              }
            />
          </label>
        ))}
        <label>
          Teisingo atsakymo nr. (0–3)
          <input
            type="number"
            min={0}
            max={3}
            value={correctIndex}
            onChange={(e) => setCorrectIndex(Number(e.target.value))}
          />
        </label>
        <label>
          Paaiškinimas
          <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={3} />
        </label>
        <button className="btn btn-primary" type="submit">
          Pridėti klausimą
        </button>
        {msg && <p className="muted">{msg}</p>}
      </form>

      {extra.length > 0 && (
        <div className="history-list" style={{ marginTop: '1.25rem' }}>
          {extra.map((q) => (
            <div key={q.id} className="history-item">
              <span>{q.question}</span>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  await api(`/admin/questions/${q.id}`, { method: 'DELETE' });
                  onSaved();
                }}
              >
                Šalinti
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminCards({
  cards,
  onChange,
}: {
  cards: { id: string; front: string; back: string }[];
  onChange: () => void;
}) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  return (
    <div>
      <form
        className="form-card"
        onSubmit={async (e) => {
          e.preventDefault();
          await api('/admin/cards', {
            method: 'POST',
            body: JSON.stringify({ front, back }),
          });
          setFront('');
          setBack('');
          onChange();
        }}
      >
        <label>
          Sąvoka (priekinė pusė)
          <input value={front} onChange={(e) => setFront(e.target.value)} required />
        </label>
        <label>
          Paaiškinimas (nugara)
          <textarea value={back} onChange={(e) => setBack(e.target.value)} rows={3} required />
        </label>
        <button className="btn btn-primary" type="submit">
          Skelbti visiems
        </button>
      </form>
      <div className="history-list" style={{ marginTop: '1.25rem' }}>
        {cards.map((c) => (
          <div key={c.id} className="history-item">
            <span>
              <strong>{c.front}</strong> — {c.back}
            </span>
            <button
              className="btn btn-danger"
              onClick={async () => {
                await api(`/admin/cards/${c.id}`, { method: 'DELETE' });
                onChange();
              }}
            >
              Šalinti
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
