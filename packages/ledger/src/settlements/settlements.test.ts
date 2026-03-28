import { validateCreateSettlement, canConfirm } from './index';
import type { Settlement } from '@godutch/commons';
import type { UserId, GuestId, GroupId, SettlementId } from '@godutch/commons';

const uid = (s: string): UserId => s as UserId;
const gid = (s: string): GuestId => s as GuestId;

function makeSettlement(
  overrides: Partial<Settlement> = {},
): Settlement {
  return {
    id: 'st1' as SettlementId,
    groupId: 'g1' as GroupId,
    payerId: uid('alice'),
    receiverId: uid('bob'),
    amountCents: 500,
    currency: 'USD',
    date: '2026-01-15',
    status: 'pending',
    initiatedBy: uid('alice'),
    createdAt: '2026-01-15T00:00:00Z',
    ...overrides,
  };
}

describe('validateCreateSettlement', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('returns no errors for a valid settlement', () => {
    const errors = validateCreateSettlement({
      groupId: 'g1' as GroupId,
      payerId: uid('alice'),
      receiverId: uid('bob'),
      amountCents: 500,
      currency: 'USD',
      date: '2026-01-15',
      initiatedBy: uid('alice'),
    });
    expect(errors).toHaveLength(0);
  });

  it('accepts a guest receiver', () => {
    const errors = validateCreateSettlement({
      groupId: 'g1' as GroupId,
      payerId: uid('alice'),
      receiverId: gid('guest_1'),
      amountCents: 500,
      currency: 'USD',
      date: '2026-01-15',
      initiatedBy: uid('alice'),
    });
    expect(errors).toHaveLength(0);
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('rejects when payer and receiver are the same', () => {
    const errors = validateCreateSettlement({
      groupId: 'g1' as GroupId,
      payerId: uid('alice'),
      receiverId: uid('alice'),
      amountCents: 500,
      currency: 'USD',
      date: '2026-01-15',
      initiatedBy: uid('alice'),
    });
    expect(errors).toContain('Payer and receiver must differ');
  });

  it('rejects zero amount', () => {
    const errors = validateCreateSettlement({
      groupId: 'g1' as GroupId,
      payerId: uid('alice'),
      receiverId: uid('bob'),
      amountCents: 0,
      currency: 'USD',
      date: '2026-01-15',
      initiatedBy: uid('alice'),
    });
    expect(errors).toContain('Settlement amount must be greater than zero');
  });

  it('rejects negative amount', () => {
    const errors = validateCreateSettlement({
      groupId: 'g1' as GroupId,
      payerId: uid('alice'),
      receiverId: uid('bob'),
      amountCents: -100,
      currency: 'USD',
      date: '2026-01-15',
      initiatedBy: uid('alice'),
    });
    expect(errors).toContain('Settlement amount must be greater than zero');
  });

  it('rejects invalid date format', () => {
    const errors = validateCreateSettlement({
      groupId: 'g1' as GroupId,
      payerId: uid('alice'),
      receiverId: uid('bob'),
      amountCents: 500,
      currency: 'USD',
      date: '15/01/2026',
      initiatedBy: uid('alice'),
    });
    expect(errors).toContain('Date must be YYYY-MM-DD');
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('returns multiple errors when multiple fields are invalid', () => {
    const errors = validateCreateSettlement({
      groupId: 'g1' as GroupId,
      payerId: uid('alice'),
      receiverId: uid('alice'),
      amountCents: 0,
      currency: 'USD',
      date: 'bad-date',
      initiatedBy: uid('alice'),
    });
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('accepts 1 cent', () => {
    const errors = validateCreateSettlement({
      groupId: 'g1' as GroupId,
      payerId: uid('alice'),
      receiverId: uid('bob'),
      amountCents: 1,
      currency: 'USD',
      date: '2026-01-15',
      initiatedBy: uid('alice'),
    });
    expect(errors).toHaveLength(0);
  });
});

describe('canConfirm', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('returns true when receiver confirms a pending settlement', () => {
    const settlement = makeSettlement({ status: 'pending', receiverId: uid('bob') });
    expect(canConfirm(settlement, uid('bob'))).toBe(true);
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('returns false when payer tries to confirm', () => {
    const settlement = makeSettlement({ status: 'pending', payerId: uid('alice'), receiverId: uid('bob') });
    expect(canConfirm(settlement, uid('alice'))).toBe(false);
  });

  it('returns false when settlement is already confirmed', () => {
    const settlement = makeSettlement({ status: 'confirmed', receiverId: uid('bob') });
    expect(canConfirm(settlement, uid('bob'))).toBe(false);
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('returns false for an unrelated third party', () => {
    const settlement = makeSettlement({ status: 'pending', receiverId: uid('bob') });
    expect(canConfirm(settlement, uid('carol'))).toBe(false);
  });
});
