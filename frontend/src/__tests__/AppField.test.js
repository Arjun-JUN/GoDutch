import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { Field, AppInput, AppTextarea } from '../slate/components/AppField';

describe('AppField Components', () => {
  describe('Field', () => {
    it('renders with label and htmlFor', () => {
      render(
        <Field label="Username" htmlFor="user-input">
          <input id="user-input" />
        </Field>
      );
      const label = screen.getByText('Username');
      expect(label).toBeDefined();
      expect(label.getAttribute('for')).toBe('user-input');
    });

    it('renders without label if not provided', () => {
      const { container } = render(<Field><input /></Field>);
      expect(container.querySelector('label')).toBeNull();
    });
  });

  describe('AppInput', () => {
    it('renders as an input element with app-input class', () => {
      render(<AppInput placeholder="Test Input" />);
      const input = screen.getByPlaceholderText('Test Input');
      expect(input.tagName).toBe('INPUT');
      expect(input.className).toContain('app-input');
    });

    it('calls onChange when value changes', () => {
      const onChange = vi.fn();
      render(<AppInput onChange={onChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      expect(onChange).toHaveBeenCalled();
    });

    it('forwards ref correctly', () => {
      const ref = createRef();
      render(<AppInput ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('AppTextarea', () => {
    it('renders as a textarea element', () => {
      render(<AppTextarea placeholder="Test Area" />);
      const textarea = screen.getByPlaceholderText('Test Area');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('forwards ref correctly', () => {
      const ref = createRef();
      render(<AppTextarea ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });
  });
});
