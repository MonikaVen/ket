import { useCallback, useEffect, useMemo, useState } from 'react';
import { chapters } from '../data/chapters';
import {
  questionSourceId,
  questionToCard,
  signDescriptionToCard,
  toCardPayload,
} from '../data/cards';
import { signs } from '../data/signs';
import type { ConceptCard, QuizQuestion, RoadSign } from '../data/types';
import { api, apiOptional } from '../api/client';
import { useAuth } from './useAuth';
import { useContent } from './useContent';

const STORAGE_KEY = 'ket-mokykla-cards-v1';

export type CardDraft = {
  front: string;
  back: string;
  kind?: ConceptCard['kind'];
  sourceId?: string;
  prompt?: ConceptCard['prompt'];
};

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

function sameCard(a: ConceptCard, b: Pick<ConceptCard, 'id' | 'sourceId' | 'front' | 'back'>) {
  if (a.id === b.id) return true;
  if (a.sourceId && b.sourceId && a.sourceId === b.sourceId) return true;
  return a.front === b.front && a.back === b.back;
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

export function useCards() {
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
        const dup = remote.some((r) => sameCard(r, card));
        if (dup) continue;
        await apiOptional('/cards', {
          method: 'POST',
          body: JSON.stringify(toCardPayload(card)),
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

  const hasSource = useCallback(
    (sourceId: string) => mine.some((c) => c.sourceId === sourceId || c.id === sourceId),
    [mine],
  );

  const addCards = useCallback(
    async (drafts: CardDraft[]): Promise<{ added: number; skipped: number }> => {
      const current = loadLocal();
      const fresh = drafts
        .map((d) => ({
          front: d.front.trim(),
          back: d.back.trim(),
          kind: d.kind ?? 'concept',
          sourceId: d.sourceId,
          prompt: d.prompt,
        }))
        .filter((d) => d.front && d.back)
        .filter((d) => !current.some((c) => sameCard(c, { id: d.sourceId ?? '', ...d })));
      if (!fresh.length) return { added: 0, skipped: drafts.length };

      if (user) {
        const data = await api<{ cards: ConceptCard[]; skipped: number }>('/cards/batch', {
          method: 'POST',
          body: JSON.stringify({ cards: fresh }),
        });
        const next = [...current];
        for (const card of data.cards) {
          if (!next.some((c) => sameCard(c, card))) next.push(card);
        }
        saveLocal(next);
        setMine(next);
        return { added: data.cards.length, skipped: data.skipped + (drafts.length - fresh.length) };
      }

      const created: ConceptCard[] = fresh.map((d) => ({
        id: d.sourceId || `local-${crypto.randomUUID()}`,
        kind: d.kind,
        front: d.front,
        back: d.back,
        sourceId: d.sourceId,
        prompt: d.prompt,
        ownerId: undefined,
        createdAt: new Date().toISOString(),
      }));
      const next = [...current, ...created];
      saveLocal(next);
      setMine(next);
      return { added: created.length, skipped: drafts.length - created.length };
    },
    [user],
  );

  const addCard = useCallback(
    async (input: CardDraft) => {
      const result = await addCards([input]);
      return result.added > 0;
    },
    [addCards],
  );

  const addRuleCard = useCallback(
    async (ruleId: string) => {
      const card = ruleToCard(ruleId);
      if (!card) return false;
      const result = await addCards([toCardPayload(card)]);
      return result.added > 0;
    },
    [addCards],
  );

  const addQuestionCards = useCallback(
    async (pool: QuizQuestion[]) => addCards(pool.map((q) => toCardPayload(questionToCard(q)))),
    [addCards],
  );

  const addSignDescriptionCards = useCallback(
    async (list: RoadSign[] = signs) =>
      addCards(list.map((s) => toCardPayload(signDescriptionToCard(s)))),
    [addCards],
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

  const signCards: ConceptCard[] = useMemo(
    () =>
      signs.map((s) => ({
        id: `sign-${s.id}`,
        kind: 'sign' as const,
        prompt: 'visual' as const,
        front: s.code,
        back: `${s.name}\n\n${s.meaning}`,
        sourceId: s.id,
        createdAt: '',
      })),
    [],
  );

  const allCards = useMemo(() => {
    const byId = new Map<string, ConceptCard>();
    for (const c of [...signCards, ...globalCards, ...mine]) byId.set(c.id, c);
    return [...byId.values()];
  }, [signCards, globalCards, mine]);

  return {
    mine,
    globalCards,
    signCards,
    allCards,
    hasSource,
    addCard,
    addCards,
    addRuleCard,
    addQuestionCards,
    addSignDescriptionCards,
    removeCard,
    questionSourceId,
  };
}
