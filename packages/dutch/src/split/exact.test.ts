import { splitByExact } from './exact';
import { SplitMode, asUserId } from '@godutch/commons';
import type { SplitParticipant } from '@godutch/commons';

const user = (id: string): SplitParticipant => ({ type: 'user', userId: asUserId(id) });

describe('splitByExact', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('accepts exact splits that sum to total', () => {
    const result = splitByExact(1000, [
      { participant: user('a'), shareAmountCents: 600 },
      { participant: user('b'), shareAmountCents: 400 },
    ]);
    expect(result[0]!.shareAmountCents).toBe(600);
    expect(result[1]!.shareAmountCents).toBe(400);
  });

  it('assigns SplitMode.Exact to every share', () => {
    const result = splitByExact(500, [
      { participant: user('a'), shareAmountCents: 500 },
    ]);
    expect(result[0]!.splitMode).toBe(SplitMode.Exact);
  });

  it('accepts 1-cent tolerance (off by +1)', () => {
    expect(() =>
      splitByExact(1000, [
        { participant: user('a'), shareAmountCents: 501 },
        { participant: user('b'), shareAmountCents: 500 },
      ]),
    ).not.toThrow();
  });

  it('accepts 1-cent tolerance (off by -1)', () => {
    expect(() =>
      splitByExact(1000, [
        { participant: user('a'), shareAmountCents: 499 },
        { participant: user('b'), shareAmountCents: 500 },
      ]),
    ).not.toThrow();
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('throws when allocations are empty', () => {
    expect(() => splitByExact(1000, [])).toThrow('allocations must not be empty');
  });

  it('throws when splits are off by more than 1 cent', () => {
    expect(() =>
      splitByExact(1000, [
        { participant: user('a'), shareAmountCents: 300 },
        { participant: user('b'), shareAmountCents: 300 },
      ]),
    ).toThrow();
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('single participant can take the whole amount', () => {
    const result = splitByExact(999, [
      { participant: user('solo'), shareAmountCents: 999 },
    ]);
    expect(result[0]!.shareAmountCents).toBe(999);
  });

  it('allows zero amount for a participant', () => {
    expect(() =>
      splitByExact(1000, [
        { participant: user('a'), shareAmountCents: 1000 },
        { participant: user('b'), shareAmountCents: 0 },
      ]),
    ).not.toThrow();
  });
});
