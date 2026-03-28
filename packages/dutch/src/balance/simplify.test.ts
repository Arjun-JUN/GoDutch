import { simplifyDebts } from './simplify';
import type { PersonBalance } from '@godutch/commons';
import type { UserId } from '@godutch/commons';

function makeBalance(party: string, netAmountCents: number): PersonBalance {
  return {
    party: party as UserId,
    displayName: party,
    netAmountCents,
    currency: 'USD',
  };
}

describe('simplifyDebts', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('returns empty array for no balances', () => {
    expect(simplifyDebts([])).toEqual([]);
  });

  it('simple 2-person debt: Bob owes Alice $5', () => {
    const transfers = simplifyDebts([
      makeBalance('alice', 500),
      makeBalance('bob', -500),
    ]);
    expect(transfers).toHaveLength(1);
    expect(transfers[0]!.from).toBe('bob');
    expect(transfers[0]!.to).toBe('alice');
    expect(transfers[0]!.amountCents).toBe(500);
  });

  it('three-way: minimises to two transfers', () => {
    // Alice +600, Bob -300, Carol -300
    const transfers = simplifyDebts([
      makeBalance('alice', 600),
      makeBalance('bob', -300),
      makeBalance('carol', -300),
    ]);
    expect(transfers).toHaveLength(2);
    const total = transfers.reduce((sum, t) => sum + t.amountCents, 0);
    expect(total).toBe(600);
  });

  it('returns currency from input balances', () => {
    const transfers = simplifyDebts([
      makeBalance('alice', 500),
      makeBalance('bob', -500),
    ]);
    expect(transfers[0]!.currency).toBe('USD');
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('skips zero-balance participants (no transfers generated for them)', () => {
    const transfers = simplifyDebts([
      makeBalance('alice', 0),
      makeBalance('bob', 0),
    ]);
    expect(transfers).toHaveLength(0);
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('handles asymmetric debts correctly', () => {
    // Alice +1000, Bob -600, Carol -400
    const transfers = simplifyDebts([
      makeBalance('alice', 1000),
      makeBalance('bob', -600),
      makeBalance('carol', -400),
    ]);
    const inflow = transfers.filter(t => t.to === 'alice').reduce((s, t) => s + t.amountCents, 0);
    expect(inflow).toBe(1000);
  });

  it('handles single creditor and many debtors', () => {
    const balances = [
      makeBalance('creditor', 900),
      makeBalance('d1', -300),
      makeBalance('d2', -300),
      makeBalance('d3', -300),
    ];
    const transfers = simplifyDebts(balances);
    const total = transfers.reduce((sum, t) => sum + t.amountCents, 0);
    expect(total).toBe(900);
  });

  it('chain simplification: A owes B, B owes C → A pays C directly', () => {
    // A -500, B 0, C +500 — B is already balanced
    const transfers = simplifyDebts([
      makeBalance('a', -500),
      makeBalance('b', 0),
      makeBalance('c', 500),
    ]);
    expect(transfers).toHaveLength(1);
    expect(transfers[0]!.from).toBe('a');
    expect(transfers[0]!.to).toBe('c');
  });
});
