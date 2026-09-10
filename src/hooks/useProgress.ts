import { useCallback, useEffect, useState } from 'react';
import { chapters } from '../data/chapters';
import type { ChapterId } from '../data/types';

const STORAGE_KEY = 'ket-mokykla-progress-v1';

export interface ProgressState {
  studiedRules: string[];
  masteredSigns: string[];
  quizHistory: { date: string; score: number; total: number; mode: string }[];
  chapterScores: Partial<Record<ChapterId, number>>;
  streak: number;
  lastStudyDate: string | null;
}

const defaultProgress: ProgressState = {
  studiedRules: [],
  masteredSigns: [],
  quizHistory: [],
  chapterScores: {},
  streak: 0,
  lastStudyDate: null,
};

function load(): ProgressState {
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

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(defaultProgress);

  useEffect(() => {
    setProgress(load());
  }, []);

  const save = useCallback((next: ProgressState) => {
    setProgress(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const markRuleStudied = useCallback(
    (ruleId: string) => {
      const base = load();
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
      const base = load();
      if (base.masteredSigns.includes(signId)) return;
      save({ ...base, masteredSigns: [...base.masteredSigns, signId] });
    },
    [save],
  );

  const recordQuiz = useCallback(
    (score: number, total: number, mode: string, chapterId?: ChapterId) => {
      const base = load();
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
  }, []);

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
