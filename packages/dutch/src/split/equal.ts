import type { SplitParticipant } from '@godutch/commons';
import { SplitMode } from '@godutch/commons';

export type SplitResult = {
  participant: SplitParticipant;
  shareAmountCents: number;
  splitMode: SplitMode;
};

/**
 * Split totalCents evenly across participants.
 * Odd cents go to the first participants in the array (deterministic).
 *
 * e.g. 1000 / 3 → [334, 333, 333]
 *      1001 / 3 → [334, 334, 333]
 */
export function splitEqual(
  totalCents: number,
  participants: SplitParticipant[],
): SplitResult[] {
  if (participants.length === 0) {
    throw new Error('splitEqual: participants array must not be empty');
  }
  if (totalCents < 0) {
    throw new Error('splitEqual: totalCents must be >= 0');
  }

  const n = participants.length;
  const base = Math.floor(totalCents / n);
  const remainder = totalCents % n;

  return participants.map((participant, i) => ({
    participant,
    shareAmountCents: base + (i < remainder ? 1 : 0),
    splitMode: SplitMode.Equal,
  }));
}
