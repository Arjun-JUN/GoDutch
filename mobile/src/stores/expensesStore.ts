import { create } from 'zustand';
import { api } from '../api/client';
import type { Expense } from './types';

interface ExpensesState {
  /** Cached expenses, keyed by group_id. Each list is pre-sorted by date desc. */
  byGroupId: Record<string, Expense[]>;
  loadingGroupId: Record<string, boolean>;
  errorGroupId: Record<string, string | null>;
  loadedAtGroupId: Record<string, number>;

  fetch: (groupId: string, opts?: { force?: boolean }) => Promise<void>;
  /** Insert an expense optimistically (before server confirmation). */
  addOptimistic: (expense: Expense) => void;
  /** Replace an optimistic record with the server-confirmed version. */
  replace: (tempId: string, real: Expense) => void;
  /** Remove an expense from the cache (e.g., after delete or optimistic rollback). */
  remove: (groupId: string, expenseId: string) => void;
  getForGroup: (groupId: string) => Expense[];
  /** Flat list across all known groups, sorted by created_at/date desc. */
  getAll: () => Expense[];
  invalidate: (groupId?: string) => void;
  reset: () => void;
}

const CACHE_MS = 20_000;

const sortByDateDesc = (a: Expense, b: Expense) => {
  const da = a.date || a.created_at || '';
  const db = b.date || b.created_at || '';
  return db.localeCompare(da);
};

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  byGroupId: {},
  loadingGroupId: {},
  errorGroupId: {},
  loadedAtGroupId: {},

  fetch: async (groupId, { force = false } = {}) => {
    const { loadingGroupId, loadedAtGroupId } = get();
    if (loadingGroupId[groupId]) return;
    const lastLoad = loadedAtGroupId[groupId];
    if (!force && lastLoad && Date.now() - lastLoad < CACHE_MS) return;

    set((s) => ({
      loadingGroupId: { ...s.loadingGroupId, [groupId]: true },
      errorGroupId: { ...s.errorGroupId, [groupId]: null },
    }));

    try {
      const expenses: Expense[] = await api.get(`/groups/${groupId}/expenses`);
      const sorted = (expenses ?? []).slice().sort(sortByDateDesc);
      set((s) => ({
        byGroupId: { ...s.byGroupId, [groupId]: sorted },
        loadingGroupId: { ...s.loadingGroupId, [groupId]: false },
        loadedAtGroupId: { ...s.loadedAtGroupId, [groupId]: Date.now() },
      }));
    } catch (e: any) {
      set((s) => ({
        loadingGroupId: { ...s.loadingGroupId, [groupId]: false },
        errorGroupId: {
          ...s.errorGroupId,
          [groupId]: e?.message ?? 'Failed to load expenses',
        },
      }));
    }
  },

  addOptimistic: (expense) => {
    set((s) => {
      const existing = s.byGroupId[expense.group_id] ?? [];
      return {
        byGroupId: {
          ...s.byGroupId,
          [expense.group_id]: [expense, ...existing].sort(sortByDateDesc),
        },
      };
    });
  },

  replace: (tempId, real) => {
    set((s) => {
      const list = s.byGroupId[real.group_id] ?? [];
      const idx = list.findIndex((e) => e.id === tempId);
      const next = list.slice();
      if (idx >= 0) next[idx] = real;
      else next.unshift(real);
      return {
        byGroupId: {
          ...s.byGroupId,
          [real.group_id]: next.sort(sortByDateDesc),
        },
      };
    });
  },

  remove: (groupId, expenseId) => {
    set((s) => {
      const list = s.byGroupId[groupId];
      if (!list) return s;
      return {
        byGroupId: {
          ...s.byGroupId,
          [groupId]: list.filter((e) => e.id !== expenseId),
        },
      };
    });
  },

  getForGroup: (groupId) => get().byGroupId[groupId] ?? [],

  getAll: () => {
    const { byGroupId } = get();
    return Object.values(byGroupId).flat().sort(sortByDateDesc);
  },

  invalidate: (groupId) => {
    if (groupId) {
      set((s) => {
        const next = { ...s.loadedAtGroupId };
        delete next[groupId];
        return { loadedAtGroupId: next };
      });
    } else {
      set({ loadedAtGroupId: {} });
    }
  },

  reset: () =>
    set({
      byGroupId: {},
      loadingGroupId: {},
      errorGroupId: {},
      loadedAtGroupId: {},
    }),
}));
