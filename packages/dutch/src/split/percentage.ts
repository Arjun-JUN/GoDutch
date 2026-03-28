import type { SplitParticipant } from '@godutch/commons';
import { SplitMode, ValidationError } from '@godutch/commons';
import type { SplitResult } from './equal';

export type PercentageAllocation = {
  participant: SplitParticipant;
  /** Must be a number between 0 and 100 */
  percent: number;
};

/**
 * Split totalCents by the given percentage allocations.
 * The sum of all percentages must equal exactly 100.
 * Odd cents from rounding go to the first participants.
 */
export function splitByPercentage(
  totalCents: number,
  allocations: PercentageAllocation[],
): SplitResult[] {
  if (allocations.length === 0) {
    throw new ValidationError('splitByPercentage: allocations must not be empty');
  }

  const totalPercent = allocations.reduce((sum, a) => sum + a.percent, 0);
  if (Math.abs(totalPercent - 100) > 0.001) {
    throw new ValidationError(
      `splitByPercentage: percentages must sum to 100 (got ${totalPercent.toFixed(3)})`,
    );
  }

  // Compute floor for each participant
  const shares = allocations.map(a => ({
    participant: a.participant,
    floor: Math.floor(totalCents * (a.percent / 100)),
  }));

  const floorTotal = shares.reduce((sum, s) => sum + s.floor, 0);
  let remainder = totalCents - floorTotal;

  // Distribute remainder cents starting from the front
  return shares.map((s, i) => ({
    participant: s.participant,
    shareAmountCents: s.floor + (i < remainder ? 1 : 0),
    splitMode: SplitMode.Percentage,
  }));
}
