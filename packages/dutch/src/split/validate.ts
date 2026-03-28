import type { SplitResult } from './equal';

export type ValidationResult =
  | { valid: true }
  | { valid: false; diffCents: number };

/**
 * Validate that split amounts sum to the expense total.
 * Tolerance is ±1 cent (the only acceptable rounding artifact).
 */
export function validateSplits(
  totalCents: number,
  splits: SplitResult[],
): ValidationResult {
  const splitTotal = splits.reduce((sum, s) => sum + s.shareAmountCents, 0);
  const diff = splitTotal - totalCents;

  if (Math.abs(diff) <= 1) {
    return { valid: true };
  }
  return { valid: false, diffCents: diff };
}

/** Returns the unassigned cents (positive = too little assigned, negative = too much) */
export function unassignedCents(totalCents: number, splits: SplitResult[]): number {
  const splitTotal = splits.reduce((sum, s) => sum + s.shareAmountCents, 0);
  return totalCents - splitTotal;
}
