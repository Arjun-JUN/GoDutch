import type { UserId, GroupId, GuestId } from './ids';
import type { Currency } from './money';

export type Group = {
  id: GroupId;
  name: string;
  currencyCode: Currency;
  createdBy: UserId;
  createdAt: string; // ISO 8601
};

/** A registered app user who is a member of a group */
export type RegisteredMember = {
  type: 'user';
  userId: UserId;
  displayName: string;
  avatarUrl?: string;
};

/** A guest (no app account) added by display name only */
export type GuestMember = {
  type: 'guest';
  guestId: GuestId;
  displayName: string;
};

export type Member = RegisteredMember | GuestMember;

export type GroupMembership = {
  groupId: GroupId;
  member: Member;
  joinedAt: string;
};
