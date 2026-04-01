/**
 * Unit tests for src/components/app/AppButton.js
 *
 * AppButton is a motion.button wrapper that supports variants (primary,
 * secondary, ghost, icon) and sizes (sm, md, lg, icon).
 * framer-motion is mocked via src/__mocks__/framer-motion.js so that
 * tests run in jsdom without browser animation APIs.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppButton } from '../components/app/AppButton';

describe('AppButton', () => {
  test('renders children text', () => {
    render(<AppButton>Click me</AppButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('default type is "button" (not submit)', () => {
    render(<AppButton>Save</AppButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  test('accepts type="submit"', () => {
    render(<AppButton type="submit">Submit</AppButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<AppButton onClick={handleClick}>Press</AppButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not fire onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <AppButton onClick={handleClick} disabled>
        Disabled
      </AppButton>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('has disabled attribute when disabled prop is set', () => {
    render(<AppButton disabled>Disabled</AppButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('applies additional className', () => {
    render(<AppButton className="my-custom-class">Label</AppButton>);
    expect(screen.getByRole('button')).toHaveClass('my-custom-class');
  });

  test('renders with primary variant classes', () => {
    render(<AppButton variant="primary">Primary</AppButton>);
    const btn = screen.getByRole('button');
    // rounded-full is common to the primary variant
    expect(btn).toHaveClass('rounded-full');
  });

  test('renders with secondary variant', () => {
    render(<AppButton variant="secondary">Secondary</AppButton>);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
  });

  test('renders with ghost variant', () => {
    render(<AppButton variant="ghost">Ghost</AppButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('renders with sm size', () => {
    render(<AppButton size="sm">Small</AppButton>);
    expect(screen.getByRole('button')).toHaveClass('text-sm');
  });

  test('forwards ref to the underlying button element', () => {
    const ref = React.createRef();
    render(<AppButton ref={ref}>Ref test</AppButton>);
    expect(ref.current).not.toBeNull();
    expect(ref.current.tagName).toBe('BUTTON');
  });

  test('passes through arbitrary HTML attributes', () => {
    render(<AppButton aria-label="close modal">X</AppButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'close modal');
  });

  test('renders icon variant without text content', () => {
    render(<AppButton variant="icon" aria-label="settings" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
