import { describe, it, test, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import UPIHome from '../pages/UPIHome';

// Mock external dependencies
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

vi.mock('../slate/components/Header', () => ({
  default: () => <div data-testid="header" />
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('UPIHome — In Development Blur', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default account data mock
    api.get.mockImplementation((url) => {
        if (url.includes('/upi/accounts')) return Promise.resolve([{ is_primary: true, balance: 1000, bank_name: 'Test Bank', upi_id: 'test@upi' }]);
        if (url.includes('/upi/transactions')) return Promise.resolve([]);
    });
  });

  it('renders the InDevelopmentOverlay over the content', async () => {
    render(<UPIHome />);
    
    // Check for "In Development" title from the overlay
    expect(await screen.findByText('In Development')).toBeInTheDocument();
    
    // Check for marketing/PM messages from the overlay
    expect(screen.getByText(/Our UPI integration is coming soon/i)).toBeInTheDocument();
    expect(screen.getByText(/We are currently perfecting the secure UPI integration/i)).toBeInTheDocument();
  });

  it('contains the blurred background content which is non-interactive', async () => {
    render(<UPIHome />);
    
    // The main content area should have blurring classes
    // The main content area should have blurring/disabled classes
    const contentArea = (await screen.findByText(/Payments Hub/i)).parentElement; 
    expect(await screen.findByText(/Payments Hub/i)).toBeInTheDocument();
    expect(contentArea).toHaveClass('pointer-events-none', 'select-none');
    
    // Ensure the blurred content area is set to pointer-events-none so users can't interact with what's below
    expect(contentArea).toHaveClass('pointer-events-none', 'select-none');
  });

  it('shows the overlay even if no account is found', async () => {
    // Override GET to return no accounts (EmptyState scenario)
    api.get.mockImplementation((url) => {
        if (url.includes('/upi/accounts')) return Promise.resolve([]);
        if (url.includes('/upi/transactions')) return Promise.resolve([]);
    });
    
    render(<UPIHome />);
    
    // InDevelopmentOverlay should be present even in empty state
    expect(await screen.findByText('In Development')).toBeInTheDocument();
    expect(await screen.findByText(/Link Bank Account/i)).toBeInTheDocument();
  });
});
