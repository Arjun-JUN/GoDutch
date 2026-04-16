import { create } from 'zustand';
import { api } from '../api/client';
import type { SettlementItem } from './types';

interface SettlementsState {
  byGroupId: Record<string, SettlementItem[]>;
  loadingGroupId: Record<string, boolean>;
  errorGroupId: Record<string, string | null>;
  loadedAtGroupId: Record<string, number>;

  fetch: (groupId: string, opts?: { force?: boolean }) => Promise<void>;
  getForGroup: (groupId: string) => SettlementItem[];
  invalidate: (groupId?: string) => void;
  reset: () => void;
}

const CACHE_MS = 20_000;

export const useSettlementsStore = create<SettlementsState>((set, get) => ({
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
      const items: SettlementItem[] = await api.get(
        `/groups/${groupId}/settlements`
      );
      set((s) => ({
        byGroupId: { ...s.byGroupId, [groupId]: items ?? [] },
        loadingGroupId: { ...s.loadingGroupId, [groupId]: false },
        loadedAtGroupId: { ...s.loadedAtGroupId, [groupId]: Date.now() },
      }));
    } catch (e: any) {
      set((s) => ({
        loadingGroupId: { ...s.loadingGroupId, [groupId]: false },
        errorGroupId: {
          ...s.errorGroupId,
          [groupId]: e?.message ?? 'Failed to load settlements',
        },
      }));
    }
  },

  getForGroup: (groupId) => get().byGroupId[groupId] ?? [],

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
