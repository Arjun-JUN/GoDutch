import type { ExpenseId, GroupId, UserId, SplitId, GuestId } from './ids';
import type { SplitMode } from './split-mode';

export type ExpenseSource = 'manual' | 'ocr' | 'voice';

export type Expense = {
  id: ExpenseId;
  groupId: GroupId;
  paidBy: UserId;
  amountCents: number;
  currency: string;
  description: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  source: ExpenseSource;
  merchant?: string;
  createdAt: string;
};

export type SplitParticipant =
  | { type: 'user'; userId: UserId }
  | { type: 'guest'; guestId: GuestId };

export type Split = {
  id: SplitId;
  expenseId: ExpenseId;
  participant: SplitParticipant;
  shareAmountCents: number;
  splitMode: SplitMode;
};

/** Used during expense creation before IDs are assigned */
export type CreateExpenseInput = {
  groupId: GroupId;
  paidBy: UserId;
  amountCents: number;
  currency: string;
  description: string;
  date: string;
  source: ExpenseSource;
  merchant?: string;
  splits: CreateSplitInput[];
};

export type CreateSplitInput = {
  participant: SplitParticipant;
  shareAmountCents: number;
  splitMode: SplitMode;
};
