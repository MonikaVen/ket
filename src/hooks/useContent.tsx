import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { questions as seedQuestions } from '../data/questions';
import type { ConceptCard, QuizQuestion } from '../data/types';
import { apiOptional } from '../api/client';

interface ContentCtx {
  questions: QuizQuestion[];
  globalCards: ConceptCard[];
  ready: boolean;
  reload: () => void;
}

const Ctx = createContext<ContentCtx | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [extra, setExtra] = useState<QuizQuestion[]>([]);
  const [globalCards, setGlobalCards] = useState<ConceptCard[]>([]);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await apiOptional<{ questions: QuizQuestion[]; cards: ConceptCard[] }>(
        '/content',
      );
      if (cancelled) return;
      setExtra(data?.questions ?? []);
      setGlobalCards(data?.cards ?? []);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const questions = useMemo(() => {
    const seen = new Set(seedQuestions.map((q) => q.id));
    return [...seedQuestions, ...extra.filter((q) => !seen.has(q.id))];
  }, [extra]);

  const value = useMemo(
    () => ({
      questions,
      globalCards,
      ready,
      reload: () => setTick((n) => n + 1),
    }),
    [questions, globalCards, ready],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContent() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useContent requires ContentProvider');
  return ctx;
}
