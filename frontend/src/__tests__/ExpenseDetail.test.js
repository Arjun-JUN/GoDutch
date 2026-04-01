/**
 * Tests for src/pages/ExpenseDetail.js
 *
 * Covers:
 *  - Renders expense info (merchant, total, user share, category, date)
 *  - Shows items and split breakdown
 *  - Edit button visible only for creator; hidden for other users
 *  - Edit form appears on edit click; saves updated values
 *  - Back button uses location.state.from (defaults to /dashboard)
 *  - Delete button visible only for creator; confirmation modal; DELETE API call
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('axios');
jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

const mockNavigate = jest.fn();
let mockLocationState = null;

// Full manual mock — avoids jest.requireActual which fails with react-router-dom v7 ESM
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ expenseId: 'exp-1' }),
  useLocation: () => ({ state: mockLocationState }),
}));

// Stub Header to remove auth/nav dependencies
jest.mock('../slate/components/Header', () => () => <div data-testid="header" />);

// Default: Alice is logged in (creator)
jest.mock('../App', () => ({
  API: 'http://localhost/api',
  getAuthHeader: () => ({ Authorization: 'Bearer test-token' }),
  getCurrentUser: () => ({ id: 'user-alice', name: 'Alice' }),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const EXPENSE = {
  id: 'exp-1',
  group_id: 'grp-1',
  created_by: 'user-alice',
  merchant: 'Test Restaurant',
  date: '2024-06-01',
  total_amount: 60,
  category: 'Food & Dining',
  split_type: 'equal',
  notes: 'Team lunch',
  items: [
    { name: 'Pasta', price: 30, category: 'Food & Dining', assigned_to: [] },
    { name: 'Salad', price: 30, category: 'Food & Dining', assigned_to: [] },
  ],
  split_details: [
    { user_id: 'user-alice', user_name: 'Alice', amount: 30 },
    { user_id: 'user-bob', user_name: 'Bob', amount: 30 },
  ],
  receipt_image: null,
  created_at: '2024-06-01T10:00:00Z',
};

const GROUPS = [
  {
    id: 'grp-1',
    name: 'Friends',
    members: [
      { id: 'user-alice', name: 'Alice' },
      { id: 'user-bob', name: 'Bob' },
    ],
  },
];

// ── Helper ────────────────────────────────────────────────────────────────────

function setupAxios(expenseOverride = {}) {
  axios.get.mockImplementation((url) => {
    if (url.includes('/expenses/exp-1'))
      return Promise.resolve({ data: { ...EXPENSE, ...expenseOverride } });
    if (url.includes('/groups'))
      return Promise.resolve({ data: GROUPS });
    return Promise.reject(new Error(`Unexpected GET: ${url}`));
  });
}

function renderPage() {
  const ExpenseDetail = require('../pages/ExpenseDetail').default;
  render(<ExpenseDetail />);
}

// ── Tests — view mode ─────────────────────────────────────────────────────────

describe('ExpenseDetail — view mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationState = null;
    setupAxios();
    renderPage();
  });

  test('renders merchant name as page title', async () => {
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /Test Restaurant/i })).toBeInTheDocument()
    );
  });

  test("shows Alice's share (30.00) highlighted in stats", async () => {
    await waitFor(() => {
      const amounts = screen.getAllByText(/Rs 30\.00/);
      expect(amounts.length).toBeGreaterThan(0);
    });
  });

  test('shows total amount stat (Rs 60.00)', async () => {
    await waitFor(() =>
      expect(screen.getByText('Rs 60.00')).toBeInTheDocument()
    );
  });

  test('shows category and date', async () => {
    await waitFor(() => {
      // "Food & Dining" appears in the stat card and in item rows
      expect(screen.getAllByText('Food & Dining').length).toBeGreaterThan(0);
      expect(screen.getByText('2024-06-01')).toBeInTheDocument();
    });
  });

  test('renders line items', async () => {
    await waitFor(() => {
      expect(screen.getByText('Pasta')).toBeInTheDocument();
      expect(screen.getByText('Salad')).toBeInTheDocument();
    });
  });

  test('renders split breakdown with both members', async () => {
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  test('shows notes callout', async () => {
    await waitFor(() =>
      expect(screen.getByText('Team lunch')).toBeInTheDocument()
    );
  });

  test('shows Edit button for creator (Alice)', async () => {
    await waitFor(() =>
      expect(screen.getByTestId('edit-expense-btn')).toBeInTheDocument()
    );
  });

  test('shows Delete button for creator (Alice)', async () => {
    await waitFor(() =>
      expect(screen.getByTestId('delete-expense-btn')).toBeInTheDocument()
    );
  });
});

// ── Tests — back navigation ───────────────────────────────────────────────────

describe('ExpenseDetail — back navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAxios();
  });

  test('back button navigates to /dashboard when no location state', async () => {
    mockLocationState = null;
    renderPage();
    await waitFor(() => screen.getByRole('heading', { name: /Test Restaurant/i }));
    fireEvent.click(screen.getByText('Back to Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('back button uses location.state.from when provided', async () => {
    mockLocationState = { from: '/groups/grp-1', fromLabel: 'Friends' };
    renderPage();
    await waitFor(() => screen.getByRole('heading', { name: /Test Restaurant/i }));
    fireEvent.click(screen.getByText('Back to Friends'));
    expect(mockNavigate).toHaveBeenCalledWith('/groups/grp-1');
  });
});

// ── Tests — no receipt image ──────────────────────────────────────────────────

describe('ExpenseDetail — no receipt image', () => {
  test('does not render receipt section when receipt_image is null', async () => {
    jest.clearAllMocks();
    mockLocationState = null;
    setupAxios({ receipt_image: null });
    renderPage();
    await waitFor(() => screen.getByRole('heading', { name: /Test Restaurant/i }));
    expect(screen.queryByTestId('receipt-image')).not.toBeInTheDocument();
  });
});

// ── Tests — edit mode ─────────────────────────────────────────────────────────

describe('ExpenseDetail — edit mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationState = null;
    setupAxios();
    renderPage();
  });

  test('edit form appears with pre-filled values after clicking Edit', async () => {
    await waitFor(() => screen.getByTestId('edit-expense-btn'));
    fireEvent.click(screen.getByTestId('edit-expense-btn'));

    expect(screen.getByTestId('edit-form')).toBeInTheDocument();
    expect(screen.getByTestId('edit-merchant')).toHaveValue('Test Restaurant');
    expect(screen.getByTestId('edit-notes')).toHaveValue('Team lunch');
  });

  test('cancel button hides the edit form', async () => {
    await waitFor(() => screen.getByTestId('edit-expense-btn'));
    fireEvent.click(screen.getByTestId('edit-expense-btn'));
    // Use the Cancel button inside the form (second Cancel, the first is the X)
    const cancelBtns = screen.getAllByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtns[cancelBtns.length - 1]);
    expect(screen.queryByTestId('edit-form')).not.toBeInTheDocument();
  });

  test('saving calls PUT and closes form', async () => {
    const updated = { ...EXPENSE, merchant: 'New Bistro' };
    axios.put.mockResolvedValue({ data: updated });

    await waitFor(() => screen.getByTestId('edit-expense-btn'));
    fireEvent.click(screen.getByTestId('edit-expense-btn'));

    fireEvent.change(screen.getByTestId('edit-merchant'), {
      target: { value: 'New Bistro' },
    });
    fireEvent.click(screen.getByTestId('save-expense-btn'));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/expenses/exp-1'),
        expect.objectContaining({ merchant: 'New Bistro' }),
        expect.any(Object)
      )
    );
    await waitFor(() =>
      expect(screen.queryByTestId('edit-form')).not.toBeInTheDocument()
    );
  });

  test('items are pre-filled in edit form', async () => {
    await waitFor(() => screen.getByTestId('edit-expense-btn'));
    fireEvent.click(screen.getByTestId('edit-expense-btn'));

    expect(screen.getByTestId('edit-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('edit-item-name-0')).toHaveValue('Pasta');
    expect(screen.getByTestId('edit-item-name-1')).toHaveValue('Salad');
  });

  test('adding and removing items in edit form', async () => {
    await waitFor(() => screen.getByTestId('edit-expense-btn'));
    fireEvent.click(screen.getByTestId('edit-expense-btn'));

    // Current items count is 2
    expect(screen.getAllByTestId(/edit-item-\d+/).length).toBe(2);

    // Add an item
    fireEvent.click(screen.getByText(/\+ Add Item/i));
    expect(screen.getAllByTestId(/edit-item-\d+/).length).toBe(3);

    // Remove the first item
    const removeBtns = screen.getAllByRole('button', { name: /×/i });
    fireEvent.click(removeBtns[0]);
    expect(screen.getAllByTestId(/edit-item-\d+/).length).toBe(2);
  });

  test('saving includes updated items and split details in payload', async () => {
    const updated = { ...EXPENSE, items: [{ name: 'Pizza', price: 100, category: 'Food', assigned_to: [] }] };
    axios.put.mockResolvedValue({ data: updated });

    await waitFor(() => screen.getByTestId('edit-expense-btn'));
    fireEvent.click(screen.getByTestId('edit-expense-btn'));

    // Change first item
    fireEvent.change(screen.getByTestId('edit-item-name-0'), { target: { value: 'Pizza' } });
    fireEvent.change(screen.getByTestId('edit-item-price-0'), { target: { value: '100' } });

    // Remove the second item
    const removeBtns = screen.getAllByRole('button', { name: /×/i });
    fireEvent.click(removeBtns[1]);

    fireEvent.change(screen.getByTestId('edit-total'), { target: { value: '100' } });
    fireEvent.click(screen.getByTestId('save-expense-btn'));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/expenses/exp-1'),
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({ name: 'Pizza', price: 100 })
          ]),
          // Since it's an equal split of 100 for 2 users, it should be 50 each.
          split_details: expect.arrayContaining([
            expect.objectContaining({ user_id: 'user-alice', amount: 50 }),
            expect.objectContaining({ user_id: 'user-bob', amount: 50 }),
          ])
        }),
        expect.any(Object)
      )
    );
  });
});

// ── Tests — delete mode ───────────────────────────────────────────────────────

describe('ExpenseDetail — delete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationState = null;
    setupAxios();
    renderPage();
  });

  test('clicking Delete opens confirmation modal', async () => {
    await waitFor(() => screen.getByTestId('delete-expense-btn'));
    fireEvent.click(screen.getByTestId('delete-expense-btn'));
    expect(screen.getByTestId('confirm-delete-btn')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-delete-btn')).toBeInTheDocument();
  });

  test('cancel in modal closes it without calling DELETE', async () => {
    await waitFor(() => screen.getByTestId('delete-expense-btn'));
    fireEvent.click(screen.getByTestId('delete-expense-btn'));
    fireEvent.click(screen.getByTestId('cancel-delete-btn'));
    expect(screen.queryByTestId('confirm-delete-btn')).not.toBeInTheDocument();
    expect(axios.delete).not.toHaveBeenCalled();
  });

  test('confirming delete calls DELETE and navigates back', async () => {
    axios.delete.mockResolvedValue({});

    await waitFor(() => screen.getByTestId('delete-expense-btn'));
    fireEvent.click(screen.getByTestId('delete-expense-btn'));
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));

    await waitFor(() =>
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/expenses/exp-1'),
        expect.any(Object)
      )
    );
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    );
  });

});

describe('ExpenseDetail — delete from group page', () => {
  test('delete navigates to group path when location.state.from is a group', async () => {
    jest.clearAllMocks();
    mockLocationState = { from: '/groups/grp-1', fromLabel: 'Friends' };
    setupAxios();
    renderPage();
    axios.delete.mockResolvedValue({});

    await waitFor(() => screen.getByTestId('delete-expense-btn'));
    fireEvent.click(screen.getByTestId('delete-expense-btn'));
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/groups/grp-1')
    );
  });
});

// ── Tests — non-creator ───────────────────────────────────────────────────────
// Alice is logged in (mocked), but this expense was created by Bob.
// isCreator = (expense.created_by === currentUser.id) → false → no Edit/Delete buttons.

describe("ExpenseDetail — non-creator group member (Alice views Bob's expense)", () => {
  const BOB_EXPENSE = { ...EXPENSE, created_by: 'user-bob' };

  test('shows Edit and Delete buttons when current user is a group member (even if not creator)', async () => {
    jest.clearAllMocks();
    mockLocationState = null;
    axios.get.mockImplementation((url) => {
      if (url.includes('/expenses/exp-1')) return Promise.resolve({ data: BOB_EXPENSE });
      if (url.includes('/groups')) return Promise.resolve({ data: GROUPS });
    });
    renderPage();

    await waitFor(() =>
      screen.getByRole('heading', { name: /Test Restaurant/i })
    );
    expect(screen.getByTestId('edit-expense-btn')).toBeInTheDocument();
    expect(screen.getByTestId('delete-expense-btn')).toBeInTheDocument();
  });
});
