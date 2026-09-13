import { useCallback, useEffect, useState } from 'react';
import { chapters } from '../data/chapters';
import type { ChapterId } from '../data/types';
import { apiOptional } from '../api/client';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'ket-mokykla-progress-v1';

export interface ProgressState {
  studiedRules: string[];
  masteredSigns: string[];
  quizHistory: { date: string; score: number; total: number; mode: string }[];
  chapterScores: Partial<Record<ChapterId, number>>;
  streak: number;
  lastStudyDate: string | null;
}

export const defaultProgress: ProgressState = {
  studiedRules: [],
  masteredSigns: [],
  quizHistory: [],
  chapterScores: {},
  streak: 0,
  lastStudyDate: null,
};

function loadLocal(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return { ...defaultProgress };
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function mergeProgress(a: ProgressState, b: ProgressState | null | undefined): ProgressState {
  if (!b) return a;
  const chapterScores = { ...a.chapterScores };
  for (const [k, v] of Object.entries(b.chapterScores)) {
    const key = k as ChapterId;
    chapterScores[key] = Math.max(chapterScores[key] ?? 0, v ?? 0);
  }
  const dates = [a.lastStudyDate, b.lastStudyDate].filter(Boolean).sort() as string[];
  return {
    studiedRules: [...new Set([...a.studiedRules, ...b.studiedRules])],
    masteredSigns: [...new Set([...a.masteredSigns, ...b.masteredSigns])],
    quizHistory: [...b.quizHistory, ...a.quizHistory].slice(0, 50),
    chapterScores,
    streak: Math.max(a.streak, b.streak),
    lastStudyDate: dates.at(-1) ?? null,
  };
}

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressState>(loadLocal);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = loadLocal();
      if (!user) {
        if (!cancelled) setProgress(local);
        return;
      }
      const remote = await apiOptional<{ progress: ProgressState | null }>('/progress');
      const merged = mergeProgress(local, remote?.progress ?? null);
      if (cancelled) return;
      setProgress(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      await apiOptional('/progress', {
        method: 'PUT',
        body: JSON.stringify({ progress: merged }),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const save = useCallback(
    (next: ProgressState) => {
      setProgress(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (user) {
        void apiOptional('/progress', {
          method: 'PUT',
          body: JSON.stringify({ progress: next }),
        });
      }
    },
    [user],
  );

  const markRuleStudied = useCallback(
    (ruleId: string) => {
      const base = loadLocal();
      if (base.studiedRules.includes(ruleId)) return;
      const last = base.lastStudyDate;
      const t = today();
      let streak = base.streak;
      if (last !== t) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const y = yesterday.toISOString().slice(0, 10);
        streak = last === y ? streak + 1 : 1;
      }
      save({
        ...base,
        studiedRules: [...base.studiedRules, ruleId],
        streak,
        lastStudyDate: t,
      });
    },
    [save],
  );

  const markSignMastered = useCallback(
    (signId: string) => {
      const base = loadLocal();
      if (base.masteredSigns.includes(signId)) return;
      save({ ...base, masteredSigns: [...base.masteredSigns, signId] });
    },
    [save],
  );

  const recordQuiz = useCallback(
    (score: number, total: number, mode: string, chapterId?: ChapterId) => {
      const base = loadLocal();
      const chapterScores = { ...base.chapterScores };
      if (chapterId) {
        const pct = Math.round((score / total) * 100);
        chapterScores[chapterId] = Math.max(chapterScores[chapterId] ?? 0, pct);
      }
      const t = today();
      let streak = base.streak;
      if (base.lastStudyDate !== t) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        streak = base.lastStudyDate === yesterday.toISOString().slice(0, 10) ? streak + 1 : 1;
      }
      save({
        ...base,
        quizHistory: [{ date: t, score, total, mode }, ...base.quizHistory].slice(0, 50),
        chapterScores,
        streak,
        lastStudyDate: t,
      });
    },
    [save],
  );

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress({ ...defaultProgress });
    if (user) {
      void apiOptional('/progress', {
        method: 'PUT',
        body: JSON.stringify({ progress: defaultProgress }),
      });
    }
  }, [user]);

  const totalRules = chapters.reduce((n, c) => n + c.rules.length, 0);
  const studiedPct = totalRules
    ? Math.round((progress.studiedRules.length / totalRules) * 100)
    : 0;

  return {
    progress,
    markRuleStudied,
    markSignMastered,
    recordQuiz,
    resetProgress,
    totalRules,
    studiedPct,
  };
}
