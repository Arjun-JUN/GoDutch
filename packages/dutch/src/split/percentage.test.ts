import { splitByPercentage } from './percentage';
import { SplitMode, ValidationError } from '@godutch/commons';
import type { SplitParticipant } from '@godutch/commons';

const user = (id: string): SplitParticipant => ({ type: 'user', userId: id as any });

describe('splitByPercentage', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('splits 50/50 correctly', () => {
    const result = splitByPercentage(1000, [
      { participant: user('a'), percent: 50 },
      { participant: user('b'), percent: 50 },
    ]);
    expect(result[0]!.shareAmountCents).toBe(500);
    expect(result[1]!.shareAmountCents).toBe(500);
  });

  it('splits 70/30 correctly', () => {
    const result = splitByPercentage(1000, [
      { participant: user('a'), percent: 70 },
      { participant: user('b'), percent: 30 },
    ]);
    expect(result[0]!.shareAmountCents).toBe(700);
    expect(result[1]!.shareAmountCents).toBe(300);
  });

  it('assigns SplitMode.Percentage to every share', () => {
    const result = splitByPercentage(1000, [
      { participant: user('a'), percent: 60 },
      { participant: user('b'), percent: 40 },
    ]);
    expect(result.every(r => r.splitMode === SplitMode.Percentage)).toBe(true);
  });

  it('always sums to totalCents', () => {
    // 1/3 allocation causes rounding — must still sum correctly
    const result = splitByPercentage(1000, [
      { participant: user('a'), percent: 33.333 },
      { participant: user('b'), percent: 33.333 },
      { participant: user('c'), percent: 33.334 },
    ]);
    const sum = result.reduce((acc, r) => acc + r.shareAmountCents, 0);
    expect(sum).toBe(1000);
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('throws ValidationError when allocations are empty', () => {
    expect(() => splitByPercentage(1000, [])).toThrow(ValidationError);
  });

  it('throws ValidationError when percentages do not sum to 100', () => {
    expect(() =>
      splitByPercentage(1000, [
        { participant: user('a'), percent: 40 },
        { participant: user('b'), percent: 40 },
      ]),
    ).toThrow(ValidationError);
  });

  it('throws ValidationError when sum exceeds 100', () => {
    expect(() =>
      splitByPercentage(1000, [
        { participant: user('a'), percent: 60 },
        { participant: user('b'), percent: 60 },
      ]),
    ).toThrow(ValidationError);
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('100% to a single participant', () => {
    const result = splitByPercentage(999, [{ participant: user('solo'), percent: 100 }]);
    expect(result[0]!.shareAmountCents).toBe(999);
  });

  it('0% allocation yields 0 cents for that participant', () => {
    const result = splitByPercentage(1000, [
      { participant: user('a'), percent: 100 },
      { participant: user('b'), percent: 0 },
    ]);
    expect(result[0]!.shareAmountCents).toBe(1000);
    expect(result[1]!.shareAmountCents).toBe(0);
  });

  it('accepts floating-point percentages within tolerance', () => {
    // 0.1 + 0.2 = 0.30000000000000004 — must not throw
    expect(() =>
      splitByPercentage(1000, [
        { participant: user('a'), percent: 0.1 },
        { participant: user('b'), percent: 99.9 },
      ]),
    ).not.toThrow();
  });
});
