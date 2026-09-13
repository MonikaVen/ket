import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve(process.cwd(), 'data');
const storePath = path.join(dataDir, 'store.json');

function emptyStore() {
  return {
    secret: randomBytes(32).toString('hex'),
    users: [],
    progress: {},
    userCards: {},
    adminCards: [],
    adminQuestions: [],
  };
}

function load() {
  try {
    const raw = readFileSync(storePath, 'utf8');
    return { ...emptyStore(), ...JSON.parse(raw) };
  } catch {
    const store = emptyStore();
    save(store);
    return store;
  }
}

function save(store) {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2));
}

export function getStore() {
  return load();
}

export function updateStore(mutator) {
  const store = load();
  mutator(store);
  save(store);
  return store;
}

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 32).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, 'hex');
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

export function signToken(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = createHmac('sha256', secret).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
