import type { Settlement } from '@godutch/commons';
import type { UserId } from '@godutch/commons';

export type CreateSettlementInput = {
  groupId: string;
  payerId: UserId;
  receiverId: string;
  amountCents: number;
  currency: string;
  date: string;
  initiatedBy: UserId;
};

/**
 * Validate a settlement creation input.
 * Business rules:
 * - payerId and receiverId must differ
 * - amountCents must be > 0
 * - date must be YYYY-MM-DD
 */
export function validateCreateSettlement(input: CreateSettlementInput): string[] {
  const errors: string[] = [];

  if (input.payerId === input.receiverId) errors.push('Payer and receiver must differ');
  if (input.amountCents <= 0) errors.push('Settlement amount must be greater than zero');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) errors.push('Date must be YYYY-MM-DD');

  return errors;
}

/**
 * Check whether a settlement can be confirmed by a given user.
 * Only the receiver may confirm.
 */
export function canConfirm(settlement: Settlement, userId: UserId): boolean {
  return settlement.status === 'pending' && settlement.receiverId === userId;
}
