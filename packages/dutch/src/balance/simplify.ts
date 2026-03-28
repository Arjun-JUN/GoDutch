import type { PersonBalance, DebtTransfer } from '@godutch/commons';

/**
 * Debt simplification: greedy minimum-transfer algorithm.
 * Given a list of balances (positive = owed, negative = owes),
 * returns the minimum set of transfers to zero all balances.
 *
 * Time complexity: O(n log n) per round, O(n²) worst case — acceptable for groups ≤ 100.
 */
export function simplifyDebts(balances: PersonBalance[]): DebtTransfer[] {
  if (balances.length === 0) return [];

  const currency = balances[0]?.currency ?? 'USD';

  // Separate creditors (positive) and debtors (negative)
  const creditors = balances
    .filter(b => b.netAmountCents > 0)
    .map(b => ({ party: b.party, name: b.displayName, amount: b.netAmountCents }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = balances
    .filter(b => b.netAmountCents < 0)
    .map(b => ({ party: b.party, name: b.displayName, amount: Math.abs(b.netAmountCents) }))
    .sort((a, b) => b.amount - a.amount);

  const transfers: DebtTransfer[] = [];

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]!;
    const debtor = debtors[di]!;

    const amount = Math.min(creditor.amount, debtor.amount);
    if (amount > 0) {
      transfers.push({
        from: debtor.party,
        to: creditor.party,
        amountCents: amount,
        currency,
      });
    }

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount === 0) ci++;
    if (debtor.amount === 0) di++;
  }

  return transfers;
}
