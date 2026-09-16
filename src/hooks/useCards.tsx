import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { chapters } from '../data/chapters';
import { signs } from '../data/signs';
import type { ConceptCard } from '../data/types';
import { api, apiOptional } from '../api/client';
import { useAuth } from './useAuth';
import { useContent } from './useContent';

const STORAGE_KEY = 'ket-mokykla-cards-v1';

function loadLocal(): ConceptCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConceptCard[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(cards: ConceptCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function isSameSource(a: ConceptCard, b: ConceptCard) {
  return Boolean(a.sourceId) && a.sourceId === b.sourceId;
}

function mergeCard(cards: ConceptCard[], card: ConceptCard, ...dropIds: Array<string | undefined>) {
  const drop = new Set(dropIds.filter(Boolean) as string[]);
  return [...cards.filter((c) => c.id !== card.id && !drop.has(c.id) && !isSameSource(c, card)), card];
}

export function ruleToCard(ruleId: string): ConceptCard | null {
  for (const ch of chapters) {
    const rule = ch.rules.find((r) => r.id === ruleId);
    if (!rule) continue;
    return {
      id: `rule-${rule.id}`,
      kind: 'rule',
      front: `${rule.title} (§ ${rule.number})`,
      back: rule.tip ? `${rule.text}\n\nPatarimas: ${rule.tip}` : rule.text,
      sourceId: rule.id,
      createdAt: new Date().toISOString(),
    };
  }
  return null;
}

export function signToCard(signId: string): ConceptCard | null {
  const sign = signs.find((s) => s.id === signId);
  if (!sign) return null;
  return {
    id: `sign-${sign.id}`,
    kind: 'sign',
    front: sign.code,
    back: `${sign.name}\n\n${sign.meaning}`,
    sourceId: sign.id,
    createdAt: new Date().toISOString(),
  };
}

interface CardsCtx {
  mine: ConceptCard[];
  globalCards: ConceptCard[];
  allCards: ConceptCard[];
  addCard: (input: {
    front: string;
    back: string;
    kind?: ConceptCard['kind'];
    sourceId?: string;
  }) => Promise<ConceptCard>;
  addRuleCard: (ruleId: string) => Promise<ConceptCard | undefined>;
  addSignCard: (signId: string) => Promise<ConceptCard | undefined>;
  addChapterCards: (chapterId: string) => Promise<number>;
  removeCard: (id: string) => Promise<void>;
  hasSource: (sourceId: string) => boolean;
}

const Ctx = createContext<CardsCtx | null>(null);

export function CardsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { globalCards } = useContent();
  const [mine, setMine] = useState<ConceptCard[]>(() => loadLocal());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        setMine(loadLocal());
        return;
      }
      const data = await apiOptional<{ cards: ConceptCard[] }>('/cards');
      if (cancelled) return;
      const remote = (data?.cards ?? []).filter((c) => c.ownerId);
      const local = loadLocal();
      const byId = new Map<string, ConceptCard>();
      for (const c of [...local, ...remote]) byId.set(c.id, c);
      const merged = [...byId.values()];
      saveLocal(merged);
      setMine(merged);
      for (const card of local) {
        const dup = remote.some(
          (r) =>
            r.id === card.id ||
            (Boolean(r.sourceId) && r.sourceId === card.sourceId) ||
            (r.front === card.front && r.back === card.back),
        );
        if (dup) continue;
        await apiOptional('/cards', {
          method: 'POST',
          body: JSON.stringify({
            front: card.front,
            back: card.back,
            kind: card.kind,
            sourceId: card.sourceId,
          }),
        });
      }
      const refreshed = await apiOptional<{ cards: ConceptCard[] }>('/cards');
      if (cancelled || !refreshed) return;
      const next = (refreshed.cards ?? []).filter((c) => c.ownerId);
      saveLocal(next);
      setMine(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const addCard = useCallback(
    async (input: { front: string; back: string; kind?: ConceptCard['kind']; sourceId?: string }) => {
      const localCard: ConceptCard = {
        id: `local-${crypto.randomUUID()}`,
        kind: input.kind ?? 'concept',
        front: input.front.trim(),
        back: input.back.trim(),
        sourceId: input.sourceId,
        ownerId: user?.id,
        createdAt: new Date().toISOString(),
      };
      const optimistic = mergeCard(loadLocal(), localCard);
      saveLocal(optimistic);
      setMine(optimistic);
      if (user) {
        try {
          const data = await api<{ card: ConceptCard }>('/cards', {
            method: 'POST',
            body: JSON.stringify(input),
          });
          const next = mergeCard(loadLocal(), data.card, localCard.id);
          saveLocal(next);
          setMine(next);
          return data.card;
        } catch {
          return localCard;
        }
      }
      return localCard;
    },
    [user],
  );

  const hasSource = useCallback(
    (sourceId: string) =>
      [...mine, ...globalCards].some(
        (c) => c.sourceId === sourceId || c.id === `rule-${sourceId}` || c.id === `sign-${sourceId}`,
      ),
    [mine, globalCards],
  );

  const addRuleCard = useCallback(
    async (ruleId: string) => {
      const card = ruleToCard(ruleId);
      if (!card) return;
      if (hasSource(ruleId) || loadLocal().some((c) => c.sourceId === ruleId)) return;
      return addCard({
        front: card.front,
        back: card.back,
        kind: 'rule',
        sourceId: ruleId,
      });
    },
    [addCard, hasSource],
  );

  const addSignCard = useCallback(
    async (signId: string) => {
      const card = signToCard(signId);
      if (!card) return;
      if (hasSource(signId) || loadLocal().some((c) => c.sourceId === signId)) return;
      return addCard({
        front: card.front,
        back: card.back,
        kind: 'sign',
        sourceId: signId,
      });
    },
    [addCard, hasSource],
  );

  const addChapterCards = useCallback(
    async (chapterId: string) => {
      const chapter = chapters.find((ch) => ch.id === chapterId);
      if (!chapter) return 0;
      let added = 0;
      for (const rule of chapter.rules) {
        const before = loadLocal().length;
        await addRuleCard(rule.id);
        if (loadLocal().length > before) added += 1;
      }
      return added;
    },
    [addRuleCard],
  );

  const removeCard = useCallback(
    async (id: string) => {
      const next = loadLocal().filter((c) => c.id !== id);
      saveLocal(next);
      setMine(next);
      if (user) await apiOptional(`/cards/${id}`, { method: 'DELETE' });
    },
    [user],
  );

  const allCards = useMemo(() => {
    const byId = new Map<string, ConceptCard>();
    for (const c of [...globalCards, ...mine]) byId.set(c.id, c);
    return [...byId.values()];
  }, [globalCards, mine]);

  const value = useMemo(
    () => ({
      mine,
      globalCards,
      allCards,
      addCard,
      addRuleCard,
      addSignCard,
      addChapterCards,
      removeCard,
      hasSource,
    }),
    [mine, globalCards, allCards, addCard, addRuleCard, addSignCard, addChapterCards, removeCard, hasSource],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCards() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCards requires CardsProvider');
  return ctx;
}
