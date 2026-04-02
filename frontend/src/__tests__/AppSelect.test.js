import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AppSelect } from '../slate/components/AppSelect';

// Mocking icons
const MockIcon = () => <div data-testid="mock-icon" />;

describe('AppSelect Component', () => {
  const options = [
    { label: 'Option 1', value: 'opt1', icon: MockIcon },
    { label: 'Option 2', value: 'opt2' },
  ];

  it('renders with label and placeholder', () => {
    render(
      <AppSelect 
        label="Test Label" 
        placeholder="Select something" 
        options={options} 
      />
    );
    expect(screen.getByText('Test Label')).toBeDefined();
    expect(screen.getByText('Select something')).toBeDefined();
  });

  it('renders the leading icon if provided', () => {
    render(
      <AppSelect 
        icon={MockIcon}
        options={options} 
      />
    );
    expect(screen.getByTestId('mock-icon')).toBeDefined();
  });

  it('calls onValueChange when an option is selected', async () => {
    const onValueChange = vi.fn();
    render(
      <AppSelect 
        options={options} 
        onValueChange={onValueChange} 
      />
    );

    // Open the select
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Wait for content and find option
    await waitFor(() => {
      const option = screen.getByText('Option 1');
      fireEvent.click(option);
    });

    expect(onValueChange).toHaveBeenCalledWith('opt1');
  });

  it('displays the selected value label', () => {
    render(
      <AppSelect 
        value="opt1" 
        options={options} 
      />
    );
    expect(screen.getByText('Option 1')).toBeDefined();
  });
});
