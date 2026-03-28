import type { UserId, GroupId, GuestId } from './ids';

export type BalanceParty = UserId | GuestId;

/** Net balance for one person within a group.
 *  Positive = this person is owed money.
 *  Negative = this person owes money.
 */
export type PersonBalance = {
  party: BalanceParty;
  displayName: string;
  netAmountCents: number;
  currency: string;
};

export type BalanceSummary = {
  groupId: GroupId;
  netTotalCents: number; // from the perspective of the requesting user
  currency: string;
  perPerson: PersonBalance[];
};

/** A single payment that, if made, reduces the total debt count */
export type DebtTransfer = {
  from: BalanceParty;
  to: BalanceParty;
  amountCents: number;
  currency: string;
};
