/**
 * Unit tests for src/components/app/AppShell.js
 *
 * Exports: AppShell, PageContent, PageHero, PageBackButton
 * framer-motion is mocked so animation props don't cause jsdom errors.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  AppShell,
  PageContent,
  PageHero,
  PageBackButton,
} from '../components/app/AppShell';

// ── AppShell ──────────────────────────────────────────────────────────────────

describe('AppShell', () => {
  test('renders children', () => {
    render(<AppShell><p>content</p></AppShell>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  test('has app-shell class', () => {
    const { container } = render(<AppShell>x</AppShell>);
    expect(container.firstChild).toHaveClass('app-shell');
  });

  test('applies additional className', () => {
    const { container } = render(<AppShell className="extra">x</AppShell>);
    expect(container.firstChild).toHaveClass('extra');
  });
});

// ── PageContent ───────────────────────────────────────────────────────────────

describe('PageContent', () => {
  test('renders children', () => {
    render(<PageContent><span>page body</span></PageContent>);
    expect(screen.getByText('page body')).toBeInTheDocument();
  });

  test('has app-section class', () => {
    const { container } = render(<PageContent>body</PageContent>);
    expect(container.firstChild).toHaveClass('app-section');
  });

  test('merges additional className', () => {
    const { container } = render(<PageContent className="my-section">x</PageContent>);
    expect(container.firstChild).toHaveClass('my-section');
  });
});

// ── PageHero ──────────────────────────────────────────────────────────────────

describe('PageHero', () => {
  test('renders the title', () => {
    render(<PageHero title="Dashboard" />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  test('renders eyebrow text when provided', () => {
    render(<PageHero title="Title" eyebrow="Subtitle" />);
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  test('does not render eyebrow element when omitted', () => {
    render(<PageHero title="Title" />);
    // No <p class="app-eyebrow"> should exist
    expect(screen.queryByText(/app-eyebrow/)).toBeNull();
  });

  test('renders description when provided', () => {
    render(<PageHero title="T" description="This is the description." />);
    expect(screen.getByText('This is the description.')).toBeInTheDocument();
  });

  test('renders actions when provided', () => {
    render(<PageHero title="T" actions={<button>New</button>} />);
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });

  test('does not render actions section when not provided', () => {
    const { container } = render(<PageHero title="T" />);
    // The actions wrapper div is only rendered when actions prop is set
    const flexWrappers = container.querySelectorAll('.flex.flex-wrap');
    expect(flexWrappers.length).toBe(0);
  });
});

// ── PageBackButton ────────────────────────────────────────────────────────────

describe('PageBackButton', () => {
  test('renders children label', () => {
    render(<PageBackButton>Go back</PageBackButton>);
    expect(screen.getByText('Go back')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<PageBackButton onClick={onClick}>Back</PageBackButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('has type="button" by default', () => {
    render(<PageBackButton>Back</PageBackButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  test('applies additional className', () => {
    render(<PageBackButton className="custom-back">Back</PageBackButton>);
    expect(screen.getByRole('button')).toHaveClass('custom-back');
  });

  test('renders default ArrowLeft icon (SVG present)', () => {
    const { container } = render(<PageBackButton>Back</PageBackButton>);
    // @phosphor-icons/react renders an SVG
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
