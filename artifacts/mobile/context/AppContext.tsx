import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BudgetCategory {
  id: string;
  name: string;
  type: 'needs' | 'wants' | 'savings';
  budget: number;
  spent: number;
  color: string;
}

interface UserProfile {
  xp: number;
  streak: number;
  lastVisitDate: string;
  level: number;
  totalQuizzes: number;
  bestQuizScore: number;
  completedLessons: string[];
}

interface BudgetState {
  income: number;
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
  categories: BudgetCategory[];
}

interface AppState {
  profile: UserProfile;
  budget: BudgetState;
}

interface AppContextValue extends AppState {
  updateIncome: (income: number) => void;
  updateBudgetPct: (needs: number, wants: number, savings: number) => void;
  addSpending: (categoryId: string, amount: number) => void;
  recordQuizScore: (score: number, total: number) => void;
  completeLesson: (lessonId: string) => void;
  addXP: (amount: number) => void;
  updateStreak: () => void;
}

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: 'housing', name: 'Housing', type: 'needs', budget: 0, spent: 0, color: '#06B6D4' },
  { id: 'food', name: 'Food & Groceries', type: 'needs', budget: 0, spent: 0, color: '#0891B2' },
  { id: 'transport', name: 'Transport', type: 'needs', budget: 0, spent: 0, color: '#0E7490' },
  { id: 'utilities', name: 'Utilities', type: 'needs', budget: 0, spent: 0, color: '#155E75' },
  { id: 'entertainment', name: 'Entertainment', type: 'wants', budget: 0, spent: 0, color: '#F97316' },
  { id: 'dining', name: 'Dining Out', type: 'wants', budget: 0, spent: 0, color: '#EA580C' },
  { id: 'shopping', name: 'Shopping', type: 'wants', budget: 0, spent: 0, color: '#FB923C' },
  { id: 'emergency', name: 'Emergency Fund', type: 'savings', budget: 0, spent: 0, color: '#10B981' },
  { id: 'investments', name: 'Investments', type: 'savings', budget: 0, spent: 0, color: '#059669' },
  { id: 'retirement', name: 'Retirement', type: 'savings', budget: 0, spent: 0, color: '#34D399' },
];

const DEFAULT_STATE: AppState = {
  profile: {
    xp: 0,
    streak: 0,
    lastVisitDate: '',
    level: 1,
    totalQuizzes: 0,
    bestQuizScore: 0,
    completedLessons: [],
  },
  budget: {
    income: 0,
    needsPct: 50,
    wantsPct: 30,
    savingsPct: 20,
    categories: DEFAULT_CATEGORIES,
  },
};

const STORAGE_KEY = '@finreef_state';

const AppContext = createContext<AppContextValue | null>(null);

function calcLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

function distributeCategories(
  cats: BudgetCategory[],
  income: number,
  needsPct: number,
  wantsPct: number,
  savingsPct: number
): BudgetCategory[] {
  const needsTotal = (income * needsPct) / 100;
  const wantsTotal = (income * wantsPct) / 100;
  const savingsTotal = (income * savingsPct) / 100;

  const needsCats = cats.filter(c => c.type === 'needs');
  const wantsCats = cats.filter(c => c.type === 'wants');
  const savingsCats = cats.filter(c => c.type === 'savings');

  return cats.map(cat => {
    if (cat.type === 'needs') return { ...cat, budget: Math.round(needsTotal / needsCats.length) };
    if (cat.type === 'wants') return { ...cat, budget: Math.round(wantsTotal / wantsCats.length) };
    return { ...cat, budget: Math.round(savingsTotal / savingsCats.length) };
  });
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Partial<AppState>;
          // Merge with defaults to handle stale/partial stored shapes
          const merged: AppState = {
            profile: {
              ...DEFAULT_STATE.profile,
              ...(saved.profile ?? {}),
              completedLessons: Array.isArray(saved.profile?.completedLessons)
                ? saved.profile.completedLessons
                : [],
            },
            budget: {
              ...DEFAULT_STATE.budget,
              ...(saved.budget ?? {}),
              categories:
                Array.isArray(saved.budget?.categories) && saved.budget.categories.length > 0
                  ? saved.budget.categories
                  : DEFAULT_STATE.budget.categories,
            },
          };
          setState(merged);
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const save = useCallback((next: AppState) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateIncome = useCallback((income: number) => {
    setState(prev => {
      const { needsPct, wantsPct, savingsPct } = prev.budget;
      const categories = distributeCategories(prev.budget.categories, income, needsPct, wantsPct, savingsPct);
      const next = { ...prev, budget: { ...prev.budget, income, categories } };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateBudgetPct = useCallback((needs: number, wants: number, savings: number) => {
    setState(prev => {
      const categories = distributeCategories(prev.budget.categories, prev.budget.income, needs, wants, savings);
      const next = { ...prev, budget: { ...prev.budget, needsPct: needs, wantsPct: wants, savingsPct: savings, categories } };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addSpending = useCallback((categoryId: string, amount: number) => {
    setState(prev => {
      const categories = prev.budget.categories.map(c =>
        c.id === categoryId ? { ...c, spent: c.spent + amount } : c
      );
      const next = { ...prev, budget: { ...prev.budget, categories } };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const xp = prev.profile.xp + amount;
      const level = calcLevel(xp);
      const next = { ...prev, profile: { ...prev.profile, xp, level } };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const recordQuizScore = useCallback((score: number, total: number) => {
    setState(prev => {
      const pct = Math.round((score / total) * 100);
      const bestQuizScore = Math.max(prev.profile.bestQuizScore, pct);
      const xp = prev.profile.xp + score * 10;
      const level = calcLevel(xp);
      const next = {
        ...prev,
        profile: {
          ...prev.profile,
          xp,
          level,
          bestQuizScore,
          totalQuizzes: prev.profile.totalQuizzes + 1,
        },
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const completeLesson = useCallback((lessonId: string) => {
    setState(prev => {
      if (prev.profile.completedLessons.includes(lessonId)) return prev;
      const completedLessons = [...prev.profile.completedLessons, lessonId];
      const xp = prev.profile.xp + 20;
      const level = calcLevel(xp);
      const next = { ...prev, profile: { ...prev.profile, completedLessons, xp, level } };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateStreak = useCallback(() => {
    setState(prev => {
      const today = new Date().toDateString();
      if (prev.profile.lastVisitDate === today) return prev;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const streak =
        prev.profile.lastVisitDate === yesterday ? prev.profile.streak + 1 : 1;
      const next = { ...prev, profile: { ...prev.profile, streak, lastVisitDate: today } };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{ ...state, updateIncome, updateBudgetPct, addSpending, recordQuizScore, completeLesson, addXP, updateStreak }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
