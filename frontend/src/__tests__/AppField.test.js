/**
 * Unit tests for src/components/app/AppField.js
 *
 * Exports: Field, AppInput, AppSelect, AppTextarea
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Field, AppInput, AppTextarea } from '../slate/components/AppField';
import { AppSelect } from '../slate/components/AppSelect';

// ── Field ─────────────────────────────────────────────────────────────────────

describe('Field', () => {
  test('renders label when provided', () => {
    render(
      <Field label="Email address" htmlFor="email">
        <input id="email" />
      </Field>
    );
    expect(screen.getByText('Email address')).toBeInTheDocument();
  });

  test('label has correct htmlFor attribute', () => {
    render(
      <Field label="Name" htmlFor="name-input">
        <input id="name-input" />
      </Field>
    );
    const label = screen.getByText('Name');
    expect(label).toHaveAttribute('for', 'name-input');
  });

  test('renders children', () => {
    render(
      <Field label="Field">
        <input data-testid="child-input" />
      </Field>
    );
    expect(screen.getByTestId('child-input')).toBeInTheDocument();
  });

  test('does not render label element when label prop is omitted', () => {
    render(
      <Field>
        <input data-testid="no-label-input" />
      </Field>
    );
    expect(screen.queryByRole('label')).toBeNull();
  });

  test('applies className to wrapper div', () => {
    const { container } = render(
      <Field className="custom-field-class" label="X">
        <span />
      </Field>
    );
    expect(container.firstChild).toHaveClass('custom-field-class');
  });
});

// ── AppInput ──────────────────────────────────────────────────────────────────

describe('AppInput', () => {
  test('renders an input element', () => {
    render(<AppInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  test('calls onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<AppInput onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('reflects controlled value', () => {
    render(<AppInput value="controlled" onChange={() => {}} />);
    expect(screen.getByDisplayValue('controlled')).toBeInTheDocument();
  });

  test('applies additional className', () => {
    render(<AppInput className="extra-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('extra-class');
  });

  test('has app-input class by default', () => {
    render(<AppInput />);
    expect(screen.getByRole('textbox')).toHaveClass('app-input');
  });

  test('forwards ref to underlying input', () => {
    const ref = React.createRef();
    render(<AppInput ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current.tagName).toBe('INPUT');
  });

  test('supports type="password"', () => {
    render(<AppInput type="password" data-testid="pwd" />);
    expect(screen.getByTestId('pwd')).toHaveAttribute('type', 'password');
  });

  test('supports disabled', () => {
    render(<AppInput disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

// ── AppSelect ─────────────────────────────────────────────────────────────────

describe('AppSelect', () => {
  test('renders the trigger with placeholder', () => {
    render(
      <AppSelect placeholder="Select category" options={[{ label: 'A', value: 'a' }]} />
    );
    expect(screen.getByText('Select category')).toBeInTheDocument();
  });

  test('renders the label when provided', () => {
    render(
      <AppSelect label="Category" placeholder="Select" options={[{ label: 'A', value: 'a' }]} />
    );
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  test('forwards ref to trigger button', () => {
    const ref = React.createRef();
    render(
      <AppSelect ref={ref} options={[{ label: 'A', value: 'a' }]} />
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current.tagName).toBe('BUTTON');
  });
});

// ── AppTextarea ───────────────────────────────────────────────────────────────

describe('AppTextarea', () => {
  test('renders a textarea element', () => {
    render(<AppTextarea placeholder="Write something" />);
    expect(screen.getByPlaceholderText('Write something')).toBeInTheDocument();
  });

  test('has app-input class', () => {
    render(<AppTextarea />);
    expect(screen.getByRole('textbox')).toHaveClass('app-input');
  });

  test('calls onChange on input', () => {
    const handleChange = jest.fn();
    render(<AppTextarea onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'note' } });
    expect(handleChange).toHaveBeenCalled();
  });

  test('forwards ref', () => {
    const ref = React.createRef();
    render(<AppTextarea ref={ref} />);
    expect(ref.current.tagName).toBe('TEXTAREA');
  });
});
