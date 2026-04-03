import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { AppShell, PageContent, PageHero, PageBackButton } from '../slate/components/AppShell';

// Mocking icons
const MockIcon = () => <div data-testid="mock-icon" />;

describe('AppShell Components', () => {
  describe('AppShell', () => {
    it('renders children with app-shell class', () => {
      render(<AppShell>Content</AppShell>);
      const element = screen.getByText('Content');
      expect(element.className).toContain('app-shell');
    });
  });

  describe('PageContent', () => {
    it('renders children with app-section class', () => {
      render(<PageContent>Section Content</PageContent>);
      const element = screen.getByText('Section Content');
      expect(element.className).toContain('app-section');
    });
  });

  describe('PageHero', () => {
    it('renders eyebrow, title, and description', () => {
      render(
        <PageHero 
          eyebrow="Eyebrow text" 
          title="Hero Title" 
          description="Hero description" 
        />
      );
      expect(screen.getByText('Eyebrow text')).toBeDefined();
      expect(screen.getByText('Hero Title')).toBeDefined();
      expect(screen.getByText('Hero description')).toBeDefined();
    });

    it('renders actions if provided', () => {
      render(
        <PageHero 
          title="Title" 
          actions={<button>Action</button>} 
        />
      );
      expect(screen.getByText('Action')).toBeDefined();
    });
  });

  describe('PageBackButton', () => {
    it('renders with children and icon', () => {
      render(<PageBackButton>Back</PageBackButton>);
      expect(screen.getByText('Back')).toBeDefined();
    });

    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(<PageBackButton onClick={onClick}>Back</PageBackButton>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalled();
    });
  });
});
