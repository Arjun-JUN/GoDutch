import type { SplitParticipant } from '@godutch/commons';
import { SplitMode } from '@godutch/commons';
import type { SplitResult } from './equal';
import { validateSplits } from './validate';

export type ExactAllocation = {
  participant: SplitParticipant;
  shareAmountCents: number;
};

/**
 * Split by manually-specified exact amounts.
 * Throws if the splits don't sum to totalCents (within 1 cent tolerance).
 */
export function splitByExact(
  totalCents: number,
  allocations: ExactAllocation[],
): SplitResult[] {
  if (allocations.length === 0) {
    throw new Error('splitByExact: allocations must not be empty');
  }

  const result: SplitResult[] = allocations.map(a => ({
    participant: a.participant,
    shareAmountCents: a.shareAmountCents,
    splitMode: SplitMode.Exact,
  }));

  const validation = validateSplits(totalCents, result);
  if (!validation.valid) {
    throw new Error(
      `splitByExact: splits sum to ${totalCents + validation.diffCents} cents, expected ${totalCents}`,
    );
  }

  return result;
}
