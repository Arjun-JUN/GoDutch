import { create } from 'zustand';
import { api } from '../api/client';
import type { Group } from './types';

interface GroupsState {
  groups: Group[];
  loading: boolean;
  error: string | null;
  loadedAt: number | null;

  fetch: (opts?: { force?: boolean }) => Promise<void>;
  getById: (groupId: string) => Group | undefined;
  upsert: (group: Group) => void;
  invalidate: () => void;
  reset: () => void;
}

/**
 * Cache window — if the last fetch happened within this many ms, the next
 * `fetch()` is a no-op (unless `force: true`). Keeps re-entering screens
 * from feeling sluggish without holding badly stale data.
 */
const CACHE_MS = 30_000;

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  loading: false,
  error: null,
  loadedAt: null,

  fetch: async ({ force = false } = {}) => {
    const { loadedAt, loading } = get();
    if (loading) return;
    if (!force && loadedAt && Date.now() - loadedAt < CACHE_MS) return;

    set({ loading: true, error: null });
    try {
      const groups: Group[] = await api.get('/groups');
      set({ groups: groups ?? [], loading: false, loadedAt: Date.now() });
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Failed to load groups' });
    }
  },

  getById: (groupId) => get().groups.find((g) => g.id === groupId),

  upsert: (group) => {
    const groups = get().groups.slice();
    const idx = groups.findIndex((g) => g.id === group.id);
    if (idx >= 0) groups[idx] = group;
    else groups.unshift(group);
    set({ groups });
  },

  invalidate: () => set({ loadedAt: null }),

  reset: () => set({ groups: [], loading: false, error: null, loadedAt: null }),
}));
