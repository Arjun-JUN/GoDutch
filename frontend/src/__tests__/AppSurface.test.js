import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { 
  AppSurface, 
  IconBadge, 
  MemberBadge, 
  StatCard, 
  EmptyState, 
  Callout, 
  AppModal, 
  ModalHeader 
} from '../slate/components/AppSurface';

// Mocking icons
const MockIcon = ({ size, weight }) => (
  <div data-testid="mock-icon" data-size={size} data-weight={weight} />
);

describe('AppSurface Components', () => {
  describe('AppSurface', () => {
    it('renders children with glass variant by default', () => {
      render(<AppSurface>Content</AppSurface>);
      const element = screen.getByText('Content');
      expect(element.className).toContain('app-surface');
    });

    it('renders with specific variant', () => {
      render(<AppSurface variant="soft">Soft Content</AppSurface>);
      const element = screen.getByText('Soft Content');
      expect(element.className).toContain('app-surface-soft');
    });
  });

  describe('IconBadge', () => {
    it('renders with icon and default soft tone', () => {
      render(<IconBadge icon={MockIcon} />);
      const wrapper = screen.getByTestId('mock-icon').parentElement;
      expect(wrapper.className).toContain('bg-[var(--app-soft)]');
    });

    it('renders with primary tone', () => {
      render(<IconBadge icon={MockIcon} tone="primary" />);
      const wrapper = screen.getByTestId('mock-icon').parentElement;
      expect(wrapper.className).toContain('bg-[var(--app-primary)]');
    });
  });

  describe('MemberBadge', () => {
    it('renders member name', () => {
      render(<MemberBadge>Alice</MemberBadge>);
      expect(screen.getByText('Alice')).toBeDefined();
    });

    it('applies active class when active is true', () => {
      render(<MemberBadge active={true}>Alice</MemberBadge>);
      expect(screen.getByText('Alice').className).toContain('app-chip-active');
    });
  });

  describe('StatCard', () => {
    it('renders label, value, and description', () => {
      render(
        <StatCard 
          label="Total Balance" 
          value="Rs 500" 
          description="Your monthly total" 
        />
      );
      expect(screen.getByText('Total Balance')).toBeDefined();
      expect(screen.getByText('Rs 500')).toBeDefined();
      expect(screen.getByText('Your monthly total')).toBeDefined();
    });

    it('renders icon if provided', () => {
      render(<StatCard label="Test" value="100" icon={MockIcon} />);
      expect(screen.getByTestId('mock-icon')).toBeDefined();
    });
  });

  describe('EmptyState', () => {
    it('renders title, description and action', () => {
      render(
        <EmptyState 
          title="No data" 
          description="Start by adding an expense" 
          action={<button>Add</button>}
        />
      );
      expect(screen.getByText('No data')).toBeDefined();
      expect(screen.getByText('Start by adding an expense')).toBeDefined();
      expect(screen.getByText('Add')).toBeDefined();
    });
  });

  describe('Callout', () => {
    it('renders children', () => {
      render(<Callout>Important Note</Callout>);
      expect(screen.getByText('Important Note')).toBeDefined();
    });
  });

  describe('AppModal', () => {
    it('does not render when open is false', () => {
      render(<AppModal open={false}>Modal Content</AppModal>);
      expect(screen.queryByText('Modal Content')).toBeNull();
    });

    it('renders when open is true', () => {
      render(<AppModal open={true}>Modal Content</AppModal>);
      expect(screen.getByText('Modal Content')).toBeDefined();
    });
  });

  describe('ModalHeader', () => {
    it('renders title and description', () => {
      render(<ModalHeader title="Confirm Delete" description="Are you sure?" />);
      expect(screen.getByText('Confirm Delete')).toBeDefined();
      expect(screen.getByText('Are you sure?')).toBeDefined();
    });

    it('calls onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(<ModalHeader title="Title" onClose={onClose} />);
      const closeBtn = screen.getByRole('button');
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
