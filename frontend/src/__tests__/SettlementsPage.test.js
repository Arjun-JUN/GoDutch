import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SettlementsPage from '../pages/SettlementsPage';

/**
 * Integration/Integration-style unit tests for src/pages/SettlementsPage.js
 * specifically focused on the "In Development" blurring functionality.
 */

// Mock external dependencies
vi.mock('axios');
vi.mock('../slate/components/Header', () => () => <div data-testid="header" />);
vi.mock('../App', () => ({
  API: 'http://localhost/api',
  getAuthHeader: () => ({ Authorization: 'Bearer test-token' }),
  getCurrentUser: () => ({ id: 'user-alice', name: 'Alice' }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('SettlementsPage — In Development Blur', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default account data mock
    axios.get.mockImplementation((url) => {
        if (url.includes('/groups')) return Promise.resolve({ data: [{ id: 'grp-1', name: 'Friends' }] });
        if (url.includes('/settlements')) return Promise.resolve({ data: [] });
    });
  });

  it('renders the InDevelopmentOverlay over the content', async () => {
    render(<SettlementsPage onLogout={vi.fn()} />);
    
    // Check for "In Development" title from the overlay
    expect(screen.getByText('( In Development )')).toBeInTheDocument();
    
    // Check for marketing/PM messages from the overlay
    expect(screen.getByText(/Automated group settlements are coming to GoDutch very soon/i)).toBeInTheDocument();
    expect(screen.getByText(/Our advanced balance-netting algorithm is undergoing final stress tests/i)).toBeInTheDocument();
  });

  it('contains the blurred background content which is non-interactive', async () => {
    render(<SettlementsPage onLogout={vi.fn()} />);
    
    // The main content area should have blurring classes
    const contentArea = screen.getByRole('heading', { name: /Settlements/i }).closest('.blur-sm');
    expect(contentArea).toBeInTheDocument();
    
    // Ensure the blurred content area is set to pointer-events-none so users can't interact with what's below
    expect(contentArea).toHaveClass('pointer-events-none', 'select-none');
  });

  it('renders the overlay even if settlements are found', async () => {
    // Mock found settlements
    axios.get.mockImplementation((url) => {
        if (url.includes('/groups')) return Promise.resolve({ data: [{ id: 'grp-1', name: 'Friends' }] });
        if (url.includes('/settlements')) return Promise.resolve({ data: [
            { from_user_name: 'Alice', to_user_name: 'Bob', amount: 50.0 }
        ] });
    });
    
    render(<SettlementsPage onLogout={vi.fn()} />);
    
    // InDevelopmentOverlay should be present even in empty state
    expect(screen.getByText('( In Development )')).toBeInTheDocument();
    expect(screen.getByText(/Who Owes Whom/i).closest('.blur-sm')).toBeInTheDocument();
  });
});
