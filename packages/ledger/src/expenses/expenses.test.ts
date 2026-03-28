import { validateCreateExpense } from './index';
import type { CreateExpenseInput } from '@godutch/commons';
import { SplitMode } from '@godutch/commons';
import type { UserId, GroupId } from '@godutch/commons';

const uid = (s: string): UserId => s as UserId;

function validInput(overrides: Partial<CreateExpenseInput> = {}): CreateExpenseInput {
  return {
    groupId: 'g1' as GroupId,
    paidBy: uid('alice'),
    amountCents: 1000,
    currency: 'USD',
    description: 'Thai dinner',
    date: '2026-01-15',
    source: 'manual',
    splits: [
      {
        participant: { type: 'user', userId: uid('alice') },
        shareAmountCents: 500,
        splitMode: SplitMode.Equal,
      },
      {
        participant: { type: 'user', userId: uid('bob') },
        shareAmountCents: 500,
        splitMode: SplitMode.Equal,
      },
    ],
    ...overrides,
  };
}

describe('validateCreateExpense', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('returns no errors for a valid expense', () => {
    expect(validateCreateExpense(validInput())).toHaveLength(0);
  });

  it('accepts a description at exactly 255 characters', () => {
    const errors = validateCreateExpense(validInput({ description: 'a'.repeat(255) }));
    expect(errors).toHaveLength(0);
  });

  it('accepts a 1-cent amount', () => {
    const errors = validateCreateExpense(validInput({ amountCents: 1 }));
    expect(errors).toHaveLength(0);
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('requires description', () => {
    const errors = validateCreateExpense(validInput({ description: '' }));
    expect(errors).toContain('Description is required');
  });

  it('rejects whitespace-only description', () => {
    const errors = validateCreateExpense(validInput({ description: '   ' }));
    expect(errors).toContain('Description is required');
  });

  it('rejects description over 255 characters', () => {
    const errors = validateCreateExpense(validInput({ description: 'a'.repeat(256) }));
    expect(errors).toContain('Description must be ≤ 255 characters');
  });

  it('rejects zero amount', () => {
    const errors = validateCreateExpense(validInput({ amountCents: 0 }));
    expect(errors).toContain('Amount must be greater than zero');
  });

  it('rejects negative amount', () => {
    const errors = validateCreateExpense(validInput({ amountCents: -1 }));
    expect(errors).toContain('Amount must be greater than zero');
  });

  it('rejects invalid date format', () => {
    const errors = validateCreateExpense(validInput({ date: '01/15/2026' }));
    expect(errors).toContain('Date must be YYYY-MM-DD');
  });

  it('rejects empty splits array', () => {
    const errors = validateCreateExpense(validInput({ splits: [] }));
    expect(errors).toContain('At least one split participant is required');
  });

  it('rejects negative split amount', () => {
    const errors = validateCreateExpense(
      validInput({
        splits: [
          {
            participant: { type: 'user', userId: uid('alice') },
            shareAmountCents: -1,
            splitMode: SplitMode.Exact,
          },
        ],
      }),
    );
    expect(errors).toContain('Split amounts must be >= 0');
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('returns multiple errors when multiple fields are invalid', () => {
    const errors = validateCreateExpense(
      validInput({ description: '', amountCents: 0, splits: [] }),
    );
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('accepts zero shareAmountCents for a participant', () => {
    const errors = validateCreateExpense(
      validInput({
        splits: [
          {
            participant: { type: 'user', userId: uid('alice') },
            shareAmountCents: 0,
            splitMode: SplitMode.Exact,
          },
        ],
      }),
    );
    expect(errors).not.toContain('Split amounts must be >= 0');
  });
});
