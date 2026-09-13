import { randomUUID } from 'node:crypto';
import express from 'express';
import {
  getStore,
  hashPassword,
  publicUser,
  signToken,
  updateStore,
  verifyPassword,
  verifyToken,
} from './store.mjs';

const TOKEN_DAYS = 30;

function authUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const store = getStore();
  const payload = verifyToken(token, store.secret);
  if (!payload?.uid) return null;
  return store.users.find((u) => u.id === payload.uid) ?? null;
}

function requireUser(req, res) {
  const user = authUser(req);
  if (!user) {
    res.status(401).json({ error: 'Reikia prisijungti.' });
    return null;
  }
  return user;
}

function requireAdmin(req, res) {
  const user = requireUser(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Tik administratoriui.' });
    return null;
  }
  return user;
}

function issueToken(user, secret) {
  return signToken(
    { uid: user.id, exp: Date.now() + TOKEN_DAYS * 24 * 60 * 60 * 1000 },
    secret,
  );
}

export function createApiRouter() {
  const router = express.Router();
  router.use(express.json({ limit: '1mb' }));

  router.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  router.get('/content', (_req, res) => {
    const store = getStore();
    res.json({
      questions: store.adminQuestions,
      cards: store.adminCards,
    });
  });

  router.post('/auth/register', (req, res) => {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || '');
    const name = String(req.body?.name || '').trim() || email.split('@')[0];
    if (!email.includes('@') || password.length < 6) {
      res.status(400).json({ error: 'Nurodykite el. paštą ir slaptažodį (bent 6 simboliai).' });
      return;
    }
    const store = getStore();
    if (store.users.some((u) => u.email === email)) {
      res.status(409).json({ error: 'Toks el. paštas jau užregistruotas.' });
      return;
    }
    const { salt, hash } = hashPassword(password);
    const user = {
      id: randomUUID(),
      email,
      name,
      passwordHash: hash,
      passwordSalt: salt,
      role: store.users.length === 0 ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };
    updateStore((s) => {
      s.users.push(user);
      s.progress[user.id] = req.body?.progress ?? null;
      s.userCards[user.id] = Array.isArray(req.body?.cards) ? req.body.cards : [];
    });
    const token = issueToken(user, getStore().secret);
    res.json({ token, user: publicUser(user) });
  });

  router.post('/auth/login', (req, res) => {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || '');
    const store = getStore();
    const user = store.users.find((u) => u.email === email);
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      res.status(401).json({ error: 'Neteisingas el. paštas arba slaptažodis.' });
      return;
    }
    res.json({ token: issueToken(user, store.secret), user: publicUser(user) });
  });

  router.get('/auth/me', (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    res.json({ user: publicUser(user) });
  });

  router.get('/progress', (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    const store = getStore();
    res.json({
      progress: store.progress[user.id] ?? null,
      cards: store.userCards[user.id] ?? [],
    });
  });

  router.put('/progress', (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    updateStore((s) => {
      s.progress[user.id] = req.body?.progress ?? s.progress[user.id] ?? null;
    });
    res.json({ ok: true });
  });

  router.get('/cards', (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    const store = getStore();
    res.json({
      cards: [...(store.adminCards || []), ...(store.userCards[user.id] || [])],
    });
  });

  router.post('/cards', (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    const front = String(req.body?.front || '').trim();
    const back = String(req.body?.back || '').trim();
    const kind = req.body?.kind === 'rule' || req.body?.kind === 'sign' ? req.body.kind : 'concept';
    if (!front || !back) {
      res.status(400).json({ error: 'Įrašykite sąvoką ir paaiškinimą.' });
      return;
    }
    const card = {
      id: randomUUID(),
      kind,
      front,
      back,
      sourceId: req.body?.sourceId ? String(req.body.sourceId) : undefined,
      ownerId: user.id,
      createdAt: new Date().toISOString(),
    };
    updateStore((s) => {
      s.userCards[user.id] = [...(s.userCards[user.id] || []), card];
    });
    res.json({ card });
  });

  router.delete('/cards/:id', (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    updateStore((s) => {
      s.userCards[user.id] = (s.userCards[user.id] || []).filter((c) => c.id !== req.params.id);
    });
    res.json({ ok: true });
  });

  router.get('/admin/users', (req, res) => {
    if (!requireAdmin(req, res)) return;
    const store = getStore();
    res.json({
      users: store.users.map((u) => ({
        ...publicUser(u),
        createdAt: u.createdAt,
        cardCount: (store.userCards[u.id] || []).length,
        hasProgress: Boolean(store.progress[u.id]),
      })),
    });
  });

  router.post('/admin/questions', (req, res) => {
    if (!requireAdmin(req, res)) return;
    const q = req.body?.question;
    if (!q?.question || !Array.isArray(q.options) || q.options.length < 2) {
      res.status(400).json({ error: 'Klausimui reikia teksto ir bent dviejų atsakymų.' });
      return;
    }
    const item = {
      id: q.id || `aq-${randomUUID().slice(0, 8)}`,
      chapterId: q.chapterId,
      ruleId: q.ruleId,
      question: String(q.question).trim(),
      options: q.options.map(String),
      correctIndex: Number(q.correctIndex) || 0,
      explanation: String(q.explanation || '').trim(),
    };
    updateStore((s) => {
      s.adminQuestions = [...s.adminQuestions.filter((x) => x.id !== item.id), item];
    });
    res.json({ question: item });
  });

  router.delete('/admin/questions/:id', (req, res) => {
    if (!requireAdmin(req, res)) return;
    updateStore((s) => {
      s.adminQuestions = s.adminQuestions.filter((q) => q.id !== req.params.id);
    });
    res.json({ ok: true });
  });

  router.post('/admin/cards', (req, res) => {
    if (!requireAdmin(req, res)) return;
    const front = String(req.body?.front || '').trim();
    const back = String(req.body?.back || '').trim();
    if (!front || !back) {
      res.status(400).json({ error: 'Įrašykite sąvoką ir paaiškinimą.' });
      return;
    }
    const card = {
      id: randomUUID(),
      kind: 'concept',
      front,
      back,
      ownerId: null,
      createdAt: new Date().toISOString(),
    };
    updateStore((s) => {
      s.adminCards.push(card);
    });
    res.json({ card });
  });

  router.delete('/admin/cards/:id', (req, res) => {
    if (!requireAdmin(req, res)) return;
    updateStore((s) => {
      s.adminCards = s.adminCards.filter((c) => c.id !== req.params.id);
    });
    res.json({ ok: true });
  });

  return router;
}
