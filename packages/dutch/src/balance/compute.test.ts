import { computeBalances } from './compute';
import type { Expense, Split, Settlement } from '@godutch/commons';
import { SplitMode } from '@godutch/commons';
import type { GroupId, UserId, ExpenseId, SplitId, SettlementId } from '@godutch/commons';

const gid = 'g1' as GroupId;
const alice = 'alice' as UserId;
const bob = 'bob' as UserId;
const carol = 'carol' as UserId;

const names = new Map([
  ['alice', 'Alice'],
  ['bob', 'Bob'],
  ['carol', 'Carol'],
]);

function makeExpense(id: string, paidBy: UserId, amountCents: number): Expense {
  return {
    id: id as ExpenseId,
    groupId: gid,
    paidBy,
    amountCents,
    currency: 'USD',
    description: 'Test',
    date: '2026-01-01',
    source: 'manual',
    createdAt: '2026-01-01T00:00:00Z',
  };
}

function makeSplit(
  id: string,
  expenseId: string,
  userId: UserId,
  shareAmountCents: number,
): Split {
  return {
    id: id as SplitId,
    expenseId: expenseId as ExpenseId,
    participant: { type: 'user', userId },
    shareAmountCents,
    splitMode: SplitMode.Equal,
  };
}

function makeSettlement(
  id: string,
  payerId: UserId,
  receiverId: UserId,
  amountCents: number,
  status: 'pending' | 'confirmed' = 'confirmed',
): Settlement {
  return {
    id: id as SettlementId,
    groupId: gid,
    payerId,
    receiverId,
    amountCents,
    currency: 'USD',
    date: '2026-01-01',
    status,
    initiatedBy: payerId,
    createdAt: '2026-01-01T00:00:00Z',
  };
}

describe('computeBalances', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('no expenses → zero balances', () => {
    const result = computeBalances(gid, [], [], [], 'USD', names);
    expect(result.perPerson).toHaveLength(0);
    expect(result.netTotalCents).toBe(0);
  });

  it('Alice pays $10 split equally with Bob → Alice +500, Bob -500', () => {
    const expense = makeExpense('e1', alice, 1000);
    const splits = [
      makeSplit('s1', 'e1', alice, 500),
      makeSplit('s2', 'e1', bob, 500),
    ];

    const result = computeBalances(gid, [expense], splits, [], 'USD', names);
    const aliceBalance = result.perPerson.find(p => p.party === alice);
    const bobBalance = result.perPerson.find(p => p.party === bob);

    expect(aliceBalance?.netAmountCents).toBe(500);  // paid 1000, owes 500 → net +500
    expect(bobBalance?.netAmountCents).toBe(-500);   // paid 0, owes 500 → net -500
  });

  it('confirmed settlement reduces balance', () => {
    const expense = makeExpense('e1', alice, 1000);
    const splits = [
      makeSplit('s1', 'e1', alice, 500),
      makeSplit('s2', 'e1', bob, 500),
    ];
    const settlement = makeSettlement('st1', bob, alice, 500, 'confirmed');

    const result = computeBalances(gid, [expense], splits, [settlement], 'USD', names);
    const aliceBalance = result.perPerson.find(p => p.party === alice);
    const bobBalance = result.perPerson.find(p => p.party === bob);

    expect(aliceBalance?.netAmountCents).toBe(0);
    expect(bobBalance?.netAmountCents).toBe(0);
  });

  it('returns groupId and currency on summary', () => {
    const result = computeBalances(gid, [], [], [], 'EUR', names);
    expect(result.groupId).toBe(gid);
    expect(result.currency).toBe('EUR');
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('pending settlement does NOT affect balances', () => {
    const expense = makeExpense('e1', alice, 1000);
    const splits = [
      makeSplit('s1', 'e1', alice, 500),
      makeSplit('s2', 'e1', bob, 500),
    ];
    const pendingSettlement = makeSettlement('st1', bob, alice, 500, 'pending');

    const result = computeBalances(gid, [expense], splits, [pendingSettlement], 'USD', names);
    const bobBalance = result.perPerson.find(p => p.party === bob);

    // Still owes Alice — pending doesn't count
    expect(bobBalance?.netAmountCents).toBe(-500);
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('three-way expense: payer is also a participant', () => {
    // Alice pays $900 for 3 people ($300 each)
    const expense = makeExpense('e1', alice, 900);
    const splits = [
      makeSplit('s1', 'e1', alice, 300),
      makeSplit('s2', 'e1', bob, 300),
      makeSplit('s3', 'e1', carol, 300),
    ];

    const result = computeBalances(gid, [expense], splits, [], 'USD', names);
    const aliceBalance = result.perPerson.find(p => p.party === alice);
    const bobBalance = result.perPerson.find(p => p.party === bob);
    const carolBalance = result.perPerson.find(p => p.party === carol);

    expect(aliceBalance?.netAmountCents).toBe(600);  // paid 900, owes 300
    expect(bobBalance?.netAmountCents).toBe(-300);
    expect(carolBalance?.netAmountCents).toBe(-300);
  });

  it('net total cents is zero across all participants (conservation)', () => {
    const expense = makeExpense('e1', alice, 1000);
    const splits = [
      makeSplit('s1', 'e1', alice, 334),
      makeSplit('s2', 'e1', bob, 333),
      makeSplit('s3', 'e1', carol, 333),
    ];

    const result = computeBalances(gid, [expense], splits, [], 'USD', names);
    const total = result.perPerson.reduce((sum, p) => sum + p.netAmountCents, 0);
    // Small deviation is acceptable due to 1-cent rounding
    expect(Math.abs(total)).toBeLessThanOrEqual(1);
  });

  it('uses fallback display name when map has no entry', () => {
    const expense = makeExpense('e1', 'unknown_user' as UserId, 100);
    const splits = [makeSplit('s1', 'e1', 'unknown_user' as UserId, 100)];
    const emptyNames = new Map<string, string>();

    const result = computeBalances(gid, [expense], splits, [], 'USD', emptyNames);
    const p = result.perPerson.find(b => b.party === 'unknown_user');
    expect(p?.displayName).toBe('unknown_user');
  });
});
