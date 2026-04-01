import { describe, it, test, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import SettlementsPageRedesign from '../pages/SettlementsPageRedesign';

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

describe('SettlementsPageRedesign — In Development Blur', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default account data mock
    api.get.mockImplementation((url) => {
        if (url.includes('/groups')) return Promise.resolve([{ id: 'grp-1', name: 'Friends' }]);
        if (url.includes('/settlements')) return Promise.resolve([]);
    });
  });

  it('renders the InDevelopmentOverlay over the content', async () => {
    render(<SettlementsPageRedesign />);
    
    // Check for "In Development" title from the overlay
    expect(await screen.findByText('In Development')).toBeInTheDocument();
    
    // Check for marketing/PM messages from the overlay
    expect(screen.getByText(/Automated group settlements are coming to GoDutch very soon/i)).toBeInTheDocument();
    expect(screen.getByText(/Our advanced balance-netting algorithm is undergoing final stress tests/i)).toBeInTheDocument();
  });

  it('contains the blurred background content which is non-interactive', async () => {
    render(<SettlementsPageRedesign />);
    
    // The main content area should have blurring classes
    // The main content area should have blurring/disabled classes
    // The main content area should have blurring/disabled classes
    const contentArea = (await screen.findByRole('heading', { name: /Settlements/i })).parentElement;
    expect(await screen.findByRole('heading', { name: /Settlements/i })).toBeInTheDocument();
    expect(contentArea).toHaveClass('pointer-events-none', 'select-none');
    
    // Ensure the blurred content area is set to pointer-events-none so users can't interact with what's below
    expect(contentArea).toHaveClass('pointer-events-none', 'select-none');
  });

  it('renders the overlay even if settlements are found', async () => {
    // Mock found settlements
    api.get.mockImplementation((url) => {
        if (url.includes('/groups')) return Promise.resolve([{ id: 'grp-1', name: 'Friends' }]);
        if (url.includes('/settlements')) return Promise.resolve([
            { from_user_name: 'Alice', to_user_name: 'Bob', amount: 50.0 }
        ]);
    });
    
    render(<SettlementsPageRedesign />);
    
    // InDevelopmentOverlay should be present even in empty state
    expect(await screen.findByText('In Development')).toBeInTheDocument();
    expect(await screen.findByText(/Who owes whom/i)).toBeInTheDocument();
  });
});
