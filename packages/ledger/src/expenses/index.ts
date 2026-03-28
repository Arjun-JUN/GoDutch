import type { CreateExpenseInput } from '@godutch/commons';

/**
 * Validate a create-expense input before persistence.
 * Business rules:
 * - description must be non-empty and ≤ 255 characters
 * - amountCents must be > 0
 * - date must be a valid ISO 8601 date (YYYY-MM-DD)
 * - at least one split participant required
 * - all shareAmountCents values must be >= 0
 */
export function validateCreateExpense(input: CreateExpenseInput): string[] {
  const errors: string[] = [];

  if (!input.description.trim()) errors.push('Description is required');
  if (input.description.trim().length > 255) errors.push('Description must be ≤ 255 characters');
  if (input.amountCents <= 0) errors.push('Amount must be greater than zero');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) errors.push('Date must be YYYY-MM-DD');
  if (input.splits.length === 0) errors.push('At least one split participant is required');

  for (const split of input.splits) {
    if (split.shareAmountCents < 0) {
      errors.push('Split amounts must be >= 0');
      break;
    }
  }

  return errors;
}
