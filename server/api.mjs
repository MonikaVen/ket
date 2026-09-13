import { randomUUID } from 'node:crypto';
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

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('invalid-json'));
      }
    });
    req.on('error', reject);
  });
}

function pathnameOf(req) {
  const raw = req.originalUrl || req.url || '/';
  const path = raw.split('?')[0];
  return path.startsWith('/api') ? path.slice(4) || '/' : path;
}

function bearer(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function currentUser(req) {
  const store = getStore();
  const payload = verifyToken(bearer(req), store.secret);
  if (!payload?.uid) return null;
  return store.users.find((u) => u.id === payload.uid) ?? null;
}

function issueToken(user, secret) {
  return signToken(
    { uid: user.id, exp: Date.now() + TOKEN_DAYS * 24 * 60 * 60 * 1000 },
    secret,
  );
}

async function handle(req, res) {
  const path = pathnameOf(req);
  const method = req.method || 'GET';

  if (method === 'GET' && path === '/health') {
    send(res, 200, { ok: true });
    return;
  }

  if (method === 'GET' && path === '/content') {
    const store = getStore();
    send(res, 200, {
      questions: store.adminQuestions,
      cards: store.adminCards,
    });
    return;
  }

  let body = {};
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      body = await readBody(req);
    } catch {
      send(res, 400, { error: 'Neteisingas JSON.' });
      return;
    }
  }

  if (method === 'POST' && path === '/auth/register') {
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const password = String(body.password || '');
    const name = String(body.name || '').trim() || email.split('@')[0];
    if (!email.includes('@') || password.length < 6) {
      send(res, 400, { error: 'Nurodykite el. paštą ir slaptažodį (bent 6 simboliai).' });
      return;
    }
    const store = getStore();
    if (store.users.some((u) => u.email === email)) {
      send(res, 409, { error: 'Toks el. paštas jau užregistruotas.' });
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
      s.progress[user.id] = body.progress ?? null;
      s.userCards[user.id] = Array.isArray(body.cards) ? body.cards : [];
    });
    send(res, 200, { token: issueToken(user, getStore().secret), user: publicUser(user) });
    return;
  }

  if (method === 'POST' && path === '/auth/login') {
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const password = String(body.password || '');
    const store = getStore();
    const user = store.users.find((u) => u.email === email);
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      send(res, 401, { error: 'Neteisingas el. paštas arba slaptažodis.' });
      return;
    }
    send(res, 200, { token: issueToken(user, store.secret), user: publicUser(user) });
    return;
  }

  if (method === 'GET' && path === '/auth/me') {
    const user = currentUser(req);
    if (!user) {
      send(res, 401, { error: 'Reikia prisijungti.' });
      return;
    }
    send(res, 200, { user: publicUser(user) });
    return;
  }

  if (method === 'GET' && path === '/progress') {
    const user = currentUser(req);
    if (!user) {
      send(res, 401, { error: 'Reikia prisijungti.' });
      return;
    }
    const store = getStore();
    send(res, 200, {
      progress: store.progress[user.id] ?? null,
      cards: store.userCards[user.id] ?? [],
    });
    return;
  }

  if (method === 'PUT' && path === '/progress') {
    const user = currentUser(req);
    if (!user) {
      send(res, 401, { error: 'Reikia prisijungti.' });
      return;
    }
    updateStore((s) => {
      s.progress[user.id] = body.progress ?? s.progress[user.id] ?? null;
    });
    send(res, 200, { ok: true });
    return;
  }

  if (method === 'GET' && path === '/cards') {
    const user = currentUser(req);
    if (!user) {
      send(res, 401, { error: 'Reikia prisijungti.' });
      return;
    }
    const store = getStore();
    send(res, 200, {
      cards: [...(store.adminCards || []), ...(store.userCards[user.id] || [])],
    });
    return;
  }

  if (method === 'POST' && path === '/cards') {
    const user = currentUser(req);
    if (!user) {
      send(res, 401, { error: 'Reikia prisijungti.' });
      return;
    }
    const front = String(body.front || '').trim();
    const back = String(body.back || '').trim();
    const kind = body.kind === 'rule' || body.kind === 'sign' ? body.kind : 'concept';
    if (!front || !back) {
      send(res, 400, { error: 'Įrašykite sąvoką ir paaiškinimą.' });
      return;
    }
    const card = {
      id: randomUUID(),
      kind,
      front,
      back,
      sourceId: body.sourceId ? String(body.sourceId) : undefined,
      ownerId: user.id,
      createdAt: new Date().toISOString(),
    };
    updateStore((s) => {
      s.userCards[user.id] = [...(s.userCards[user.id] || []), card];
    });
    send(res, 200, { card });
    return;
  }

  const cardDelete = path.match(/^\/cards\/([^/]+)$/);
  if (method === 'DELETE' && cardDelete) {
    const user = currentUser(req);
    if (!user) {
      send(res, 401, { error: 'Reikia prisijungti.' });
      return;
    }
    const id = decodeURIComponent(cardDelete[1]);
    updateStore((s) => {
      s.userCards[user.id] = (s.userCards[user.id] || []).filter((c) => c.id !== id);
    });
    send(res, 200, { ok: true });
    return;
  }

  if (method === 'GET' && path === '/admin/users') {
    const user = currentUser(req);
    if (!user) {
      send(res, 401, { error: 'Reikia prisijungti.' });
      return;
    }
    if (user.role !== 'admin') {
      send(res, 403, { error: 'Tik administratoriui.' });
      return;
    }
    const store = getStore();
    send(res, 200, {
      users: store.users.map((u) => ({
        ...publicUser(u),
        createdAt: u.createdAt,
        cardCount: (store.userCards[u.id] || []).length,
        hasProgress: Boolean(store.progress[u.id]),
      })),
    });
    return;
  }

  if (method === 'POST' && path === '/admin/questions') {
    const user = currentUser(req);
    if (!user) {
      send(res, 401, { error: 'Reikia prisijungti.' });
      return;
    }
    if (user.role !== 'admin') {
      send(res, 403, { error: 'Tik administratoriui.' });
      return;
    }
    const q = body.question;
    if (!q?.question || !Array.isArray(q.options) || q.options.length < 2) {
      send(res, 400, { error: 'Klausimui reikia teksto ir bent dviejų atsakymų.' });
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
    send(res, 200, { question: item });
    return;
  }

  const qDelete = path.match(/^\/admin\/questions\/([^/]+)$/);
  if (method === 'DELETE' && qDelete) {
    const user = currentUser(req);
    if (!user || user.role !== 'admin') {
      send(res, user ? 403 : 401, { error: user ? 'Tik administratoriui.' : 'Reikia prisijungti.' });
      return;
    }
    const id = decodeURIComponent(qDelete[1]);
    updateStore((s) => {
      s.adminQuestions = s.adminQuestions.filter((q) => q.id !== id);
    });
    send(res, 200, { ok: true });
    return;
  }

  if (method === 'POST' && path === '/admin/cards') {
    const user = currentUser(req);
    if (!user || user.role !== 'admin') {
      send(res, user ? 403 : 401, { error: user ? 'Tik administratoriui.' : 'Reikia prisijungti.' });
      return;
    }
    const front = String(body.front || '').trim();
    const back = String(body.back || '').trim();
    if (!front || !back) {
      send(res, 400, { error: 'Įrašykite sąvoką ir paaiškinimą.' });
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
    send(res, 200, { card });
    return;
  }

  const acDelete = path.match(/^\/admin\/cards\/([^/]+)$/);
  if (method === 'DELETE' && acDelete) {
    const user = currentUser(req);
    if (!user || user.role !== 'admin') {
      send(res, user ? 403 : 401, { error: user ? 'Tik administratoriui.' : 'Reikia prisijungti.' });
      return;
    }
    const id = decodeURIComponent(acDelete[1]);
    updateStore((s) => {
      s.adminCards = s.adminCards.filter((c) => c.id !== id);
    });
    send(res, 200, { ok: true });
    return;
  }

  send(res, 404, { error: 'Nerasta.' });
}

export function apiMiddleware(req, res, next) {
  const raw = req.originalUrl || req.url || '';
  const path = raw.split('?')[0];
  if (!path.startsWith('/api')) {
    next();
    return;
  }
  handle(req, res).catch((err) => {
    console.error(err);
    if (!res.headersSent) send(res, 500, { error: 'Serverio klaida.' });
  });
}
