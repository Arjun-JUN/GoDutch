import { describe, it, test, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import NewExpenseRedesign from '../pages/NewExpenseRedesign';

// Mock dependencies
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

vi.mock('sonner', () => ({ 
  toast: { 
    error: vi.fn(), 
    success: vi.fn(), 
    info: vi.fn(), 
    loading: vi.fn(), 
    dismiss: vi.fn() 
  } 
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: {} }),
}));

// Thorough mock of @/slate components
vi.mock('@/slate', () => ({
  Header: () => <div data-testid="header" />,
  AppButton: ({ children, onClick, disabled, className, ...props }) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
  AppInput: ({ onValueChange, ...props }) => (
    <input {...props} onChange={(e) => {
      if (props.onChange) props.onChange(e);
      if (onValueChange) onValueChange(e.target.value);
    }} />
  ),
  AppSelect: ({ label, value, onValueChange, options }) => (
    <div data-testid="group-select-container">
      <label>{label}</label>
      <select 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)} 
        data-testid="group-select"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  ),
  AppShell: ({ children }) => <div>{children}</div>,
  AppSurface: ({ children }) => <div>{children}</div>,
  PageContent: ({ children }) => <div>{children}</div>,
  Callout: ({ children }) => <div>{children}</div>,
}));

// Mock icons
vi.mock('@/slate/icons', () => ({
  ArrowLeft: () => null,
  CalendarBlank: () => null,
  Camera: () => null,
  Check: () => null,
  ImageSquare: () => null,
  Note: () => null,
  PencilSimple: () => null,
  Receipt: () => null,
  UsersThree: () => null,
  X: () => null,
}));

vi.mock('../utils/edgeAI', () => ({
  isEdgeAIReady: () => Promise.resolve(false),
  smartSplitEdge: vi.fn(),
  scanReceiptEdge: vi.fn(),
}));

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

describe('NewExpenseRedesign — OCR and Split Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue(GROUPS);
  });

  test('successful OCR scan automatically opens split modal and selects item-based tab', async () => {
    // Mock the OCR response
    api.post.mockResolvedValue({
      merchant: 'Starbucks',
      total_amount: 450,
      date: '2023-10-27',
      items: [
        { name: 'Latte', price: 200, quantity: 1 },
        { name: 'Muffin', price: 250, quantity: 1 }
      ]
    });

    render(<NewExpenseRedesign />);

    // Wait for group select and initial state
    await waitFor(() => expect(screen.getByTestId('group-select')).toBeInTheDocument());

    // Mock file upload
    const file = new File(['hello'], 'receipt.png', { type: 'image/png' });
    const input = screen.getByTestId('receipt-upload-input');
    
    // Simulate upload
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // Verify it opened the split modal
    await waitFor(() => {
      expect(screen.getByTestId('split-modal')).toBeInTheDocument();
    });

    // Verify merchant and total were set (behind the modal)
    expect(screen.getByTestId('description-input')).toHaveValue('Starbucks');
    expect(screen.getByTestId('total-input')).toHaveValue(450);

    // Verify item-based tab is active
    const itemBasedTab = screen.getByTestId('split-tab-item-based');
    expect(itemBasedTab).toHaveClass('active');

    // Verify items are listed
    expect(screen.getByText('Latte')).toBeInTheDocument();
    expect(screen.getByText('Muffin')).toBeInTheDocument();
  });

  test('OCR scan with zero items still opens split modal', async () => {
    // Mock the OCR response with no items
    api.post.mockResolvedValue({
      merchant: 'Quick Mart',
      total_amount: 150,
      items: []
    });

    render(<NewExpenseRedesign />);

    await waitFor(() => expect(screen.getByTestId('group-select')).toBeInTheDocument());

    const file = new File(['hello'], 'receipt.png', { type: 'image/png' });
    const input = screen.getByTestId('receipt-upload-input');
    
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // Modal should still open
    await waitFor(() => {
      expect(screen.getByTestId('split-modal')).toBeInTheDocument();
    });

    // Default item should be present
    expect(screen.getByText('Quick Mart')).toBeInTheDocument();
  });
});
