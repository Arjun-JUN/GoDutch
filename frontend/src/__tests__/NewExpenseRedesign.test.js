/**
 * Tests for src/pages/NewExpenseRedesign.js
 *
 * Covers:
 *  - Blank placeholder items are filtered out before submission
 *  - Valid items (name + price) are included in submission
 *  - Items with only a name or only a price are included
 */
import { describe, it, test, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import NewExpenseRedesign from '../pages/NewExpenseRedesign';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-alice', name: 'Alice' },
    isAuthenticated: true,
  })),
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../slate/components/Header', () => ({
  default: () => <div data-testid="header" />
}));

vi.mock('../utils/edgeAI', () => ({
  isEdgeAIReady: () => Promise.resolve(false),
  smartSplitEdge: vi.fn(),
  scanReceiptEdge: vi.fn(),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

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

function setupMocks() {
  api.get.mockResolvedValue(GROUPS);
  api.post.mockResolvedValue({});
}

function renderPage() {
  render(<NewExpenseRedesign />);
}

// Fill in the required fields that are always needed
async function fillRequiredFields() {
  await waitFor(() => expect(screen.getByTestId('merchant-input')).toBeInTheDocument());
  fireEvent.change(screen.getByTestId('merchant-input'), { target: { value: 'Test Shop' } });
  fireEvent.change(screen.getByTestId('total-input'), { target: { value: '100' } });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('NewExpenseRedesign — item submission filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  test('blank default item is filtered out — submits items: []', async () => {
    renderPage();
    await fillRequiredFields();

    // item-0 fields are blank by default — do NOT fill them in
    const form = screen.getByTestId('merchant-input').closest('form');
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const body = api.post.mock.calls[0][1];
    expect(body.items).toEqual([]);
  });

  test('filled item (name + price) is included in submission', async () => {
    renderPage();
    await fillRequiredFields();

    fireEvent.change(screen.getByTestId('item-name-0'), { target: { value: 'Pizza' } });
    fireEvent.change(screen.getByTestId('item-price-0'), { target: { value: '40' } });

    const form = screen.getByTestId('merchant-input').closest('form');
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const body = api.post.mock.calls[0][1];
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ name: 'Pizza', price: 40 });
  });

  test('item with only a name (no price) is included with price 0', async () => {
    renderPage();
    await fillRequiredFields();

    fireEvent.change(screen.getByTestId('item-name-0'), { target: { value: 'Misc' } });
    // leave price blank

    const form = screen.getByTestId('merchant-input').closest('form');
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const body = api.post.mock.calls[0][1];
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ name: 'Misc', price: 0 });
  });

  test('blank item mixed with valid item — only valid item submitted', async () => {
    renderPage();
    await fillRequiredFields();

    // Fill first item
    fireEvent.change(screen.getByTestId('item-name-0'), { target: { value: 'Drink' } });
    fireEvent.change(screen.getByTestId('item-price-0'), { target: { value: '20' } });

    // Add a second blank item
    fireEvent.click(screen.getByTestId('add-item-btn'));
    // item-1 left blank

    const form = screen.getByTestId('merchant-input').closest('form');
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const body = api.post.mock.calls[0][1];
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ name: 'Drink', price: 20 });
  });

  test('item with custom quantity is included correctly', async () => {
    renderPage();
    await fillRequiredFields();

    fireEvent.change(screen.getByTestId('item-name-0'), { target: { value: 'Burger' } });
    fireEvent.change(screen.getByTestId('item-price-0'), { target: { value: '150' } });
    
    // The quantity input is a native input in a div
    const qtyInput = screen.getByDisplayValue('1');
    fireEvent.change(qtyInput, { target: { value: '3' } });

    const form = screen.getByTestId('merchant-input').closest('form');
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const body = api.post.mock.calls[0][1];
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ name: 'Burger', price: 150, quantity: 3 });
  });
});
