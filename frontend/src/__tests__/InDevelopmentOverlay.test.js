import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InDevelopmentOverlay from '../slate/components/InDevelopmentOverlay';

describe('InDevelopmentOverlay Component', () => {
  it('renders with default props', () => {
    render(<InDevelopmentOverlay />);
    expect(screen.getByText('In Development')).toBeDefined();
    expect(screen.getByText('Advanced Roadmap')).toBeDefined();
  });

  it('renders with custom title and text', () => {
    render(
      <InDevelopmentOverlay 
        title="Coming Soon" 
        marketingText="Marketing Info" 
        pmText="Engineering Info" 
      />
    );
    expect(screen.getByText('Coming Soon')).toBeDefined();
    expect(screen.getByText('"Marketing Info"')).toBeDefined();
    expect(screen.getByText('Engineering Info')).toBeDefined();
  });
});
