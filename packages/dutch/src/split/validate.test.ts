import { validateSplits, unassignedCents } from './validate';
import { SplitMode, asUserId } from '@godutch/commons';
import type { SplitResult } from './equal';
import type { SplitParticipant } from '@godutch/commons';

const user = (id: string): SplitParticipant => ({ type: 'user', userId: asUserId(id) });

const makeResult = (cents: number): SplitResult => ({
  participant: user('p'),
  shareAmountCents: cents,
  splitMode: SplitMode.Equal,
});

describe('validateSplits', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('returns valid when splits sum exactly to total', () => {
    const result = validateSplits(1000, [makeResult(600), makeResult(400)]);
    expect(result.valid).toBe(true);
  });

  it('returns valid when splits are off by +1 cent', () => {
    const result = validateSplits(1000, [makeResult(501), makeResult(500)]);
    expect(result.valid).toBe(true);
  });

  it('returns valid when splits are off by -1 cent', () => {
    const result = validateSplits(1000, [makeResult(499), makeResult(500)]);
    expect(result.valid).toBe(true);
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('returns invalid when diff is +2 cents', () => {
    const result = validateSplits(1000, [makeResult(502), makeResult(500)]);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.diffCents).toBe(2);
  });

  it('returns invalid when diff is -2 cents', () => {
    const result = validateSplits(1000, [makeResult(498), makeResult(500)]);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.diffCents).toBe(-2);
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('returns valid for empty splits array when total is 0', () => {
    const result = validateSplits(0, []);
    expect(result.valid).toBe(true);
  });

  it('returns invalid for empty splits array when total > 0', () => {
    const result = validateSplits(100, []);
    expect(result.valid).toBe(false);
  });
});

describe('unassignedCents', () => {
  it('returns 0 when splits sum exactly to total', () => {
    expect(unassignedCents(1000, [makeResult(600), makeResult(400)])).toBe(0);
  });

  it('returns positive when some cents are unassigned', () => {
    expect(unassignedCents(1000, [makeResult(500)])).toBe(500);
  });

  it('returns negative when over-assigned', () => {
    expect(unassignedCents(1000, [makeResult(600), makeResult(500)])).toBe(-100);
  });
});
