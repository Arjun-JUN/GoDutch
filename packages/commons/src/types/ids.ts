/** Branded ID types prevent accidental mix-ups between different entity IDs */

export type UserId = string & { readonly _brand: 'UserId' };
export type GroupId = string & { readonly _brand: 'GroupId' };
export type ExpenseId = string & { readonly _brand: 'ExpenseId' };
export type SplitId = string & { readonly _brand: 'SplitId' };
export type SettlementId = string & { readonly _brand: 'SettlementId' };
export type GuestId = string & { readonly _brand: 'GuestId' };

/** Cast helpers — use only at system boundaries (API responses, DB reads) */
export const asUserId = (s: string): UserId => s as UserId;
export const asGroupId = (s: string): GroupId => s as GroupId;
export const asExpenseId = (s: string): ExpenseId => s as ExpenseId;
export const asSplitId = (s: string): SplitId => s as SplitId;
export const asSettlementId = (s: string): SettlementId => s as SettlementId;
export const asGuestId = (s: string): GuestId => s as GuestId;
