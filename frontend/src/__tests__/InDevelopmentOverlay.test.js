import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import InDevelopmentOverlay from '../components/InDevelopmentOverlay';

/**
 * Unit tests for InDevelopmentOverlay component.
 */
describe('InDevelopmentOverlay', () => {
  it('renders with default props', () => {
    render(<InDevelopmentOverlay />);
    
    // Check if the main development title is present
    expect(screen.getByText('( In Development )')).toBeInTheDocument();
    
    // Check if default marketing text exists (using partial match for flexibility)
    expect(screen.getByText(/Experience the future of seamless settlements/i)).toBeInTheDocument();
    
    // Check if default PM text exists
    expect(screen.getByText(/Feature in Development/i)).toBeInTheDocument();
    
    // Check if the badge is present
    expect(screen.getByText('Feature Status')).toBeInTheDocument();
  });

  it('renders custom title and content correctly', () => {
    const customTitle = "Launch Impending";
    const customMarketing = "Our new payment engine is almost ready.";
    const customPM = "Optimizing for high-throughput transactions.";
    
    render(
      <InDevelopmentOverlay 
        title={customTitle}
        marketingText={customMarketing}
        pmText={customPM}
      />
    );
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(customMarketing))).toBeInTheDocument();
    expect(screen.getByText(customPM)).toBeInTheDocument();
  });

  it('contains the styling attributes for blurring and centering', () => {
    const { container } = render(<InDevelopmentOverlay />);
    
    // The component uses backdrop-blur-md on its background div
    const blurBackdrop = container.querySelector('.backdrop-blur-md');
    expect(blurBackdrop).toBeInTheDocument();
    
    // The component should be centered using flexbox
    const overlayWrapper = container.firstChild;
    expect(overlayWrapper).toHaveClass('flex', 'items-center', 'justify-center');
  });
});
