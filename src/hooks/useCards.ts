import { useCallback, useEffect, useMemo, useState } from 'react';
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

  const addRuleCard = useCallback(
    async (ruleId: string) => {
      const card = ruleToCard(ruleId);
      if (!card) return;
      if (mine.some((c) => c.sourceId === ruleId || c.id === card.id)) return;
      await addCard({
        front: card.front,
        back: card.back,
        kind: 'rule',
        sourceId: ruleId,
      });
    },
    [addCard, mine],
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
        kind: 'sign',
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

  return { mine, globalCards, signCards, allCards, addCard, addRuleCard, removeCard };
}
