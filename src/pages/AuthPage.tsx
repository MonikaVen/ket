import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function AuthPage() {
  const { user, ready, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!ready) return <p className="muted">Kraunama…</p>;

  if (user) {
    return (
      <div className="result-card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1>Sveiki, {user.name}</h1>
        <p className="muted" style={{ margin: '0.75rem 0 1.25rem' }}>
          {user.email}
          {user.role === 'admin' ? ' · administratorius' : ''}
        </p>
        <div className="quiz-actions" style={{ justifyContent: 'center' }}>
          <Link className="btn btn-primary" to="/pazanga">
            Pažanga
          </Link>
          {user.role === 'admin' && (
            <Link className="btn btn-ghost" to="/admin">
              Admin
            </Link>
          )}
        </div>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else {
        let progress;
        let cards;
        try {
          progress = JSON.parse(localStorage.getItem('ket-mokykla-progress-v1') || 'null');
          cards = JSON.parse(localStorage.getItem('ket-mokykla-cards-v1') || '[]');
        } catch {
          progress = null;
          cards = [];
        }
        await register(email, password, name, { progress, cards });
      }
      navigate('/pazanga');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nepavyko. Bandykite dar kartą.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-panel">
      <div className="section-head">
        <div>
          <span className="eyebrow">Paskyra</span>
          <h1>{mode === 'login' ? 'Prisijungti' : 'Registruotis'}</h1>
          <p>
            Mokytis, testuotis ir žiūrėti ženklus galima be paskyros. Registracija išsaugo pažangą
            serveryje, kad galėtumėte grįžti kitame įrenginyje.
          </p>
        </div>
      </div>
      <form className="form-card" onSubmit={submit}>
        {mode === 'register' && (
          <label>
            Vardas
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Monika" />
          </label>
        )}
        <label>
          El. paštas
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label>
          Slaptažodis
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary" disabled={busy} type="submit">
          {busy ? 'Palaukite…' : mode === 'login' ? 'Prisijungti' : 'Sukurti paskyrą'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Neturite paskyros? Registruokitės' : 'Jau turite paskyrą? Prisijunkite'}
        </button>
      </form>
    </div>
  );
}
