import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { ExpenseCard } from '../slate/components/ExpenseCard';

// Dummy icon
const MockIcon = () => <div data-testid="mock-icon" />;

describe('ExpenseCard Component', () => {
  const expense = {
    id: 'exp1',
    merchant: 'Starbucks',
    date: '2023-10-01',
    total_amount: 500,
  };

  it('renders merchant name, date and amount', () => {
    render(<ExpenseCard expense={expense} amount={250} />);
    expect(screen.getByText('Starbucks')).toBeDefined();
    expect(screen.getByText('2023-10-01')).toBeDefined();
    expect(screen.getByText('250.00')).toBeDefined();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ExpenseCard expense={expense} amount={250} onClick={onClick} />);
    const button = screen.getByTestId('expense-exp1');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it('renders custom amount label if provided', () => {
    render(<ExpenseCard expense={expense} amount={250} amountLabel="TOTAL BILL" />);
    expect(screen.getByText('TOTAL BILL')).toBeDefined();
  });

  it('renders custom icon if provided', () => {
    render(<ExpenseCard expense={expense} amount={250} icon={MockIcon} />);
    expect(screen.getByTestId('mock-icon')).toBeDefined();
  });
});
