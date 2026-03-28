import { splitEqual } from './equal';
import { SplitMode } from '@godutch/commons';
import type { SplitParticipant } from '@godutch/commons';

const user = (id: string): SplitParticipant => ({ type: 'user', userId: id as any });

describe('splitEqual', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('splits evenly with no remainder', () => {
    const result = splitEqual(1000, [user('a'), user('b')]);
    expect(result).toHaveLength(2);
    expect(result[0]!.shareAmountCents).toBe(500);
    expect(result[1]!.shareAmountCents).toBe(500);
  });

  it('assigns SplitMode.Equal to every share', () => {
    const result = splitEqual(300, [user('a'), user('b'), user('c')]);
    expect(result.every(r => r.splitMode === SplitMode.Equal)).toBe(true);
  });

  it('preserves participant references', () => {
    const p = user('alice');
    const result = splitEqual(100, [p]);
    expect(result[0]!.participant).toBe(p);
  });

  it('splits a single participant — full amount', () => {
    const result = splitEqual(999, [user('solo')]);
    expect(result[0]!.shareAmountCents).toBe(999);
  });

  // ── Remainder distribution ──────────────────────────────────────────────
  it('distributes remainder cents to the front participants', () => {
    // 1000 / 3 → 334, 333, 333
    const result = splitEqual(1000, [user('a'), user('b'), user('c')]);
    expect(result[0]!.shareAmountCents).toBe(334);
    expect(result[1]!.shareAmountCents).toBe(333);
    expect(result[2]!.shareAmountCents).toBe(333);
  });

  it('distributes 2-cent remainder to first two participants', () => {
    // 1001 / 3 → 334, 334, 333
    const result = splitEqual(1001, [user('a'), user('b'), user('c')]);
    expect(result[0]!.shareAmountCents).toBe(334);
    expect(result[1]!.shareAmountCents).toBe(334);
    expect(result[2]!.shareAmountCents).toBe(333);
  });

  it('always sums to totalCents', () => {
    for (const total of [1, 99, 100, 101, 999, 1000, 1001, 10007]) {
      for (const n of [1, 2, 3, 5, 7]) {
        const participants = Array.from({ length: n }, (_, i) => user(`p${i}`));
        const result = splitEqual(total, participants);
        const sum = result.reduce((acc, r) => acc + r.shareAmountCents, 0);
        expect(sum).toBe(total);
      }
    }
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('throws when participants array is empty', () => {
    expect(() => splitEqual(1000, [])).toThrow('participants array must not be empty');
  });

  it('throws when totalCents is negative', () => {
    expect(() => splitEqual(-1, [user('a')])).toThrow('totalCents must be >= 0');
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('handles zero total', () => {
    const result = splitEqual(0, [user('a'), user('b')]);
    expect(result[0]!.shareAmountCents).toBe(0);
    expect(result[1]!.shareAmountCents).toBe(0);
  });

  it('handles 1 cent split among many — only first participant gets the cent', () => {
    const result = splitEqual(1, [user('a'), user('b'), user('c')]);
    expect(result[0]!.shareAmountCents).toBe(1);
    expect(result[1]!.shareAmountCents).toBe(0);
    expect(result[2]!.shareAmountCents).toBe(0);
  });
});
