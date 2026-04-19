/**
 * Unit tests for expensesStore — covers the new `update` method and regression
 * tests for all existing methods (addOptimistic, replace, remove, getForGroup,
 * getAll, invalidate, reset, fetch).
 *
 * API calls are mocked at the module level so no network is required.
 */

import { act } from 'react';
import { useExpensesStore } from '../expensesStore';
import { api } from '../../api/client';
import type { Expense } from '../types';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: 'exp-1',
  group_id: 'group-1',
  created_by: 'user-1',
  merchant: 'Swiggy',
  total_amount: 500,
  date: '2024-01-15',
  created_at: '2024-01-15T10:00:00Z',
  ...overrides,
});

/** Reset store state between tests */
const resetStore = () => {
  act(() => {
    useExpensesStore.getState().reset();
  });
};

// ── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetStore();
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// update()
// ─────────────────────────────────────────────────────────────────────────────

describe('update()', () => {
  it('replaces the matching expense in the correct group', () => {
    const original = makeExpense({ id: 'exp-1', merchant: 'Swiggy', total_amount: 500 });
    const updated = makeExpense({ id: 'exp-1', merchant: 'Zomato', total_amount: 650 });

    act(() => {
      useExpensesStore.getState().addOptimistic(original);
    });

    act(() => {
      useExpensesStore.getState().update('group-1', 'exp-1', updated);
    });

    const list = useExpensesStore.getState().getForGroup('group-1');
    expect(list).toHaveLength(1);
    expect(list[0].merchant).toBe('Zomato');
    expect(list[0].total_amount).toBe(650);
  });

  it('is a no-op when the expenseId does not exist in the group', () => {
    const existing = makeExpense({ id: 'exp-1' });
    const phantom = makeExpense({ id: 'phantom-id', merchant: 'Ghost' });

    act(() => {
      useExpensesStore.getState().addOptimistic(existing);
    });

    act(() => {
      useExpensesStore.getState().update('group-1', 'phantom-id', phantom);
    });

    const list = useExpensesStore.getState().getForGroup('group-1');
    // existing entry untouched, phantom not inserted
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('exp-1');
  });

  it('does not mutate other groups', () => {
    const exp1 = makeExpense({ id: 'exp-1', group_id: 'group-1', date: '2024-01-15' });
    const exp2 = makeExpense({ id: 'exp-2', group_id: 'group-2', date: '2024-01-16' });
    const updatedExp1 = makeExpense({ id: 'exp-1', group_id: 'group-1', merchant: 'Updated', date: '2024-01-15' });

    act(() => {
      useExpensesStore.getState().addOptimistic(exp1);
      useExpensesStore.getState().addOptimistic(exp2);
    });

    act(() => {
      useExpensesStore.getState().update('group-1', 'exp-1', updatedExp1);
    });

    const g1 = useExpensesStore.getState().getForGroup('group-1');
    const g2 = useExpensesStore.getState().getForGroup('group-2');

    expect(g1[0].merchant).toBe('Updated');
    expect(g2[0].id).toBe('exp-2'); // untouched
  });

  it('re-sorts the group list by date descending after update', () => {
    const older = makeExpense({ id: 'exp-old', date: '2024-01-01', merchant: 'Old' });
    const newer = makeExpense({ id: 'exp-new', date: '2024-06-01', merchant: 'New' });

    act(() => {
      useExpensesStore.getState().addOptimistic(older);
      useExpensesStore.getState().addOptimistic(newer);
    });

    // Update old expense with a more recent date
    const promotedOlder = makeExpense({ id: 'exp-old', date: '2024-12-01', merchant: 'Promoted' });
    act(() => {
      useExpensesStore.getState().update('group-1', 'exp-old', promotedOlder);
    });

    const list = useExpensesStore.getState().getForGroup('group-1');
    // 2024-12-01 > 2024-06-01
    expect(list[0].id).toBe('exp-old');
    expect(list[1].id).toBe('exp-new');
  });

  it('handles updating when group has no pre-existing cache (empty list)', () => {
    // group-1 not populated, update should still be a no-op without throwing
    const expense = makeExpense({ id: 'exp-1' });
    expect(() => {
      act(() => {
        useExpensesStore.getState().update('group-1', 'exp-1', expense);
      });
    }).not.toThrow();
    expect(useExpensesStore.getState().getForGroup('group-1')).toEqual([]);
  });

  it('preserves all expense fields during update', () => {
    const original = makeExpense({ id: 'exp-1' });
    const updated: Expense = {
      id: 'exp-1',
      group_id: 'group-1',
      created_by: 'user-1',
      merchant: 'Updated Merchant',
      total_amount: 999.99,
      date: '2024-03-20',
      category: 'Travel',
      notes: 'Updated note',
      split_type: 'equally',
      split_details: [{ user_id: 'u1', amount: 999.99 }],
    };

    act(() => {
      useExpensesStore.getState().addOptimistic(original);
      useExpensesStore.getState().update('group-1', 'exp-1', updated);
    });

    const list = useExpensesStore.getState().getForGroup('group-1');
    expect(list[0]).toEqual(updated);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// addOptimistic() — regression
// ─────────────────────────────────────────────────────────────────────────────

describe('addOptimistic()', () => {
  it('prepends an expense and sorts by date', () => {
    const e1 = makeExpense({ id: 'e1', date: '2024-01-01' });
    const e2 = makeExpense({ id: 'e2', date: '2024-06-01' });

    act(() => {
      useExpensesStore.getState().addOptimistic(e1);
      useExpensesStore.getState().addOptimistic(e2);
    });

    const list = useExpensesStore.getState().getForGroup('group-1');
    expect(list[0].id).toBe('e2');
    expect(list[1].id).toBe('e1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// replace() — regression
// ─────────────────────────────────────────────────────────────────────────────

describe('replace()', () => {
  it('swaps the optimistic record with the server record', () => {
    const optimistic = makeExpense({ id: 'temp-123', merchant: 'Temp' });
    const real = makeExpense({ id: 'real-abc', merchant: 'Real' });

    act(() => {
      useExpensesStore.getState().addOptimistic(optimistic);
      useExpensesStore.getState().replace('temp-123', real);
    });

    const list = useExpensesStore.getState().getForGroup('group-1');
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('real-abc');
  });

  it('inserts at front when tempId is not found', () => {
    const real = makeExpense({ id: 'real-abc' });

    act(() => {
      useExpensesStore.getState().replace('missing-temp', real);
    });

    const list = useExpensesStore.getState().getForGroup('group-1');
    expect(list[0].id).toBe('real-abc');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// remove() — regression
// ─────────────────────────────────────────────────────────────────────────────

describe('remove()', () => {
  it('removes the matching expense from the group', () => {
    const e1 = makeExpense({ id: 'e1' });
    const e2 = makeExpense({ id: 'e2' });

    act(() => {
      useExpensesStore.getState().addOptimistic(e1);
      useExpensesStore.getState().addOptimistic(e2);
      useExpensesStore.getState().remove('group-1', 'e1');
    });

    const list = useExpensesStore.getState().getForGroup('group-1');
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('e2');
  });

  it('is a no-op when groupId has no cache', () => {
    expect(() => {
      act(() => {
        useExpensesStore.getState().remove('nonexistent', 'exp-1');
      });
    }).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getAll() — regression
// ─────────────────────────────────────────────────────────────────────────────

describe('getAll()', () => {
  it('returns flat list across multiple groups sorted by date desc', () => {
    const e1 = makeExpense({ id: 'e1', group_id: 'group-1', date: '2024-01-01' });
    const e2 = makeExpense({ id: 'e2', group_id: 'group-2', date: '2024-06-01' });
    const e3 = makeExpense({ id: 'e3', group_id: 'group-1', date: '2024-03-15' });

    act(() => {
      useExpensesStore.getState().addOptimistic(e1);
      useExpensesStore.getState().addOptimistic(e2);
      useExpensesStore.getState().addOptimistic(e3);
    });

    const all = useExpensesStore.getState().getAll();
    expect(all.map((e) => e.id)).toEqual(['e2', 'e3', 'e1']);
  });

  it('returns empty array when no expenses loaded', () => {
    expect(useExpensesStore.getState().getAll()).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// invalidate() — regression
// ─────────────────────────────────────────────────────────────────────────────

describe('invalidate()', () => {
  it('clears loadedAt for a specific group so next fetch is forced', async () => {
    mockApi.get.mockResolvedValue([makeExpense()]);

    await act(async () => {
      await useExpensesStore.getState().fetch('group-1');
    });

    expect(useExpensesStore.getState().loadedAtGroupId['group-1']).toBeTruthy();

    act(() => {
      useExpensesStore.getState().invalidate('group-1');
    });

    expect(useExpensesStore.getState().loadedAtGroupId['group-1']).toBeUndefined();
  });

  it('clears all groups when called without argument', async () => {
    mockApi.get.mockResolvedValue([makeExpense()]);

    await act(async () => {
      await useExpensesStore.getState().fetch('group-1');
      await useExpensesStore.getState().fetch('group-2');
    });

    act(() => {
      useExpensesStore.getState().invalidate();
    });

    expect(useExpensesStore.getState().loadedAtGroupId).toEqual({});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// fetch() — regression
// ─────────────────────────────────────────────────────────────────────────────

describe('fetch()', () => {
  it('populates byGroupId from API and sorts desc', async () => {
    const expenses = [
      makeExpense({ id: 'e1', date: '2024-01-01' }),
      makeExpense({ id: 'e2', date: '2024-06-01' }),
    ];
    mockApi.get.mockResolvedValue(expenses);

    await act(async () => {
      await useExpensesStore.getState().fetch('group-1');
    });

    const list = useExpensesStore.getState().getForGroup('group-1');
    expect(list[0].id).toBe('e2');
    expect(list[1].id).toBe('e1');
  });

  it('skips refetch within cache window', async () => {
    mockApi.get.mockResolvedValue([makeExpense()]);

    await act(async () => {
      await useExpensesStore.getState().fetch('group-1');
    });

    await act(async () => {
      await useExpensesStore.getState().fetch('group-1');
    });

    expect(mockApi.get).toHaveBeenCalledTimes(1);
  });

  it('force-fetches despite cache when force=true', async () => {
    mockApi.get.mockResolvedValue([makeExpense()]);

    await act(async () => {
      await useExpensesStore.getState().fetch('group-1');
    });

    await act(async () => {
      await useExpensesStore.getState().fetch('group-1', { force: true });
    });

    expect(mockApi.get).toHaveBeenCalledTimes(2);
  });

  it('sets error state on API failure', async () => {
    mockApi.get.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      await useExpensesStore.getState().fetch('group-1');
    });

    expect(useExpensesStore.getState().errorGroupId['group-1']).toBe('Network error');
    expect(useExpensesStore.getState().loadingGroupId['group-1']).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// reset() — regression
// ─────────────────────────────────────────────────────────────────────────────

describe('reset()', () => {
  it('clears all state', async () => {
    mockApi.get.mockResolvedValue([makeExpense()]);

    await act(async () => {
      await useExpensesStore.getState().fetch('group-1');
    });

    act(() => {
      useExpensesStore.getState().reset();
    });

    const state = useExpensesStore.getState();
    expect(state.byGroupId).toEqual({});
    expect(state.loadedAtGroupId).toEqual({});
    expect(state.errorGroupId).toEqual({});
    expect(state.loadingGroupId).toEqual({});
  });
});
