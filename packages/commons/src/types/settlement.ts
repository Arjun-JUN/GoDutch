import type { SettlementId, GroupId, UserId, GuestId } from './ids';

export type SettlementStatus = 'pending' | 'confirmed';

export type Settlement = {
  id: SettlementId;
  groupId: GroupId;
  payerId: UserId;
  /** Receiver is always a registered user (guests auto-confirm) */
  receiverId: UserId | GuestId;
  amountCents: number;
  currency: string;
  date: string;
  status: SettlementStatus;
  initiatedBy: UserId;
  confirmedBy?: UserId;
  confirmedAt?: string;
  createdAt: string;
};
