import type {
  Expense,
  Split,
  Settlement,
  BalanceSummary,
  PersonBalance,
} from '@godutch/commons';
import type { GroupId, BalanceParty } from '@godutch/commons';
import { asUserId, asGuestId } from '@godutch/commons';

type ParticipantKey = string; // userId or guestId

function participantKey(split: Split): ParticipantKey {
  return split.participant.type === 'user'
    ? `user:${split.participant.userId}`
    : `guest:${split.participant.guestId}`;
}

/**
 * Compute net balances for all participants in a group from the transaction log.
 *
 * INVARIANT: Balances are NEVER stored — they are computed fresh each time.
 *
 * Algorithm:
 * 1. For each expense: credit the payer (they are owed the total);
 *    debit each split participant (they owe their share).
 * 2. For each *confirmed* settlement: debit the payer (they paid);
 *    credit the receiver (they received).
 * 3. Net balance = total credits - total debits per person.
 *    Positive = owed money. Negative = owes money.
 */
export function computeBalances(
  groupId: GroupId,
  expenses: Expense[],
  splits: Split[],
  settlements: Settlement[],
  currency: string,
  displayNames: Map<string, string>,
): BalanceSummary {
  // ledger: key → net cents (positive = owed to them)
  const ledger = new Map<ParticipantKey, number>();

  const credit = (key: ParticipantKey, cents: number) => {
    ledger.set(key, (ledger.get(key) ?? 0) + cents);
  };
  const debit = (key: ParticipantKey, cents: number) => {
    ledger.set(key, (ledger.get(key) ?? 0) - cents);
  };

  // Split map for quick lookup
  const splitsByExpense = new Map<string, Split[]>();
  for (const split of splits) {
    const list = splitsByExpense.get(split.expenseId) ?? [];
    list.push(split);
    splitsByExpense.set(split.expenseId, list);
  }

  // Process expenses
  for (const expense of expenses) {
    const payerKey = `user:${expense.paidBy}`;
    const expenseSplits = splitsByExpense.get(expense.id) ?? [];

    // Payer is credited the full amount
    credit(payerKey, expense.amountCents);

    // Each participant is debited their share
    for (const split of expenseSplits) {
      debit(participantKey(split), split.shareAmountCents);
    }
  }

  // Process confirmed settlements
  for (const settlement of settlements) {
    if (settlement.status !== 'confirmed') continue;
    const payerKey = `user:${settlement.payerId}`;
    const receiverKey = settlement.receiverId.startsWith('guest_')
      ? `guest:${settlement.receiverId}`
      : `user:${settlement.receiverId}`;

    debit(payerKey, settlement.amountCents);
    credit(receiverKey, settlement.amountCents);
  }

  const perPerson: PersonBalance[] = [];
  for (const [key, netCents] of ledger.entries()) {
    const [prefix, rawId] = key.split(':') as [string, string];
    const party: BalanceParty =
      prefix === 'guest' ? asGuestId(rawId) : asUserId(rawId);
    perPerson.push({
      party,
      displayName: displayNames.get(rawId) ?? rawId,
      netAmountCents: netCents,
      currency,
    });
  }

  const netTotalCents = perPerson.reduce((sum, p) => sum + p.netAmountCents, 0);

  return { groupId, netTotalCents, currency, perPerson };
}
