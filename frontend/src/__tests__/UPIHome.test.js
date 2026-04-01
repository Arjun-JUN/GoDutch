import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UPIHome from '../pages/UPIHome';

/**
 * Integration/Integration-style unit tests for src/pages/UPIHome.js
 * specifically focused on the "In Development" blurring functionality.
 */

// Mock external dependencies
vi.mock('axios');
vi.mock('../components/Header', () => () => <div data-testid="header" />);
vi.mock('../App', () => ({
  API: 'http://localhost/api',
  getAuthHeader: () => ({ Authorization: 'Bearer test-token' }),
  getCurrentUser: () => ({ id: 'user-alice', name: 'Alice' }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('UPIHome — In Development Blur', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default account data mock
    axios.get.mockImplementation((url) => {
        if (url.includes('/upi/accounts')) return Promise.resolve({ data: [{ is_primary: true, balance: 1000, bank_name: 'Test Bank', upi_id: 'test@upi' }] });
        if (url.includes('/upi/transactions')) return Promise.resolve({ data: [] });
    });
  });

  it('renders the InDevelopmentOverlay over the content', async () => {
    render(<UPIHome onLogout={vi.fn()} />);
    
    // Check for "In Development" title from the overlay
    expect(screen.getByText('( In Development )')).toBeInTheDocument();
    
    // Check for marketing/PM messages from the overlay
    expect(screen.getByText(/Our UPI integration is coming soon/i)).toBeInTheDocument();
    expect(screen.getByText(/We are currently perfecting the secure UPI integration/i)).toBeInTheDocument();
  });

  it('contains the blurred background content which is non-interactive', async () => {
    render(<UPIHome onLogout={vi.fn()} />);
    
    // The main content area should have blurring classes
    const contentArea = screen.getByText(/Payments Hub/i).closest('.blur-sm');
    expect(contentArea).toBeInTheDocument();
    
    // Ensure the blurred content area is set to pointer-events-none so users can't interact with what's below
    expect(contentArea).toHaveClass('pointer-events-none', 'select-none');
  });

  it('shows the overlay even if no account is found', async () => {
    // Override GET to return no accounts (EmptyState scenario)
    axios.get.mockImplementation((url) => {
        if (url.includes('/upi/accounts')) return Promise.resolve({ data: [] });
        if (url.includes('/upi/transactions')) return Promise.resolve({ data: [] });
    });
    
    render(<UPIHome onLogout={vi.fn()} />);
    
    // InDevelopmentOverlay should be present even in empty state
    expect(screen.getByText('( In Development )')).toBeInTheDocument();
    expect(screen.getByText(/Link Bank Account/i).closest('.blur-sm')).toBeInTheDocument();
  });
});
