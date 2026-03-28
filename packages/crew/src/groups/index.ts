import type { GroupMembership, Member } from '@godutch/commons';
import type { UserId } from '@godutch/commons';

export type CreateGroupInput = {
  name: string;
  currencyCode: string;
  createdBy: UserId;
};

/**
 * Validate a group creation input.
 * Business rules:
 * - name must be non-empty and ≤ 100 characters
 * - currencyCode must be a non-empty string (validated against known list at API layer)
 */
export function validateCreateGroup(input: CreateGroupInput): string[] {
  const errors: string[] = [];
  if (!input.name.trim()) errors.push('Group name is required');
  if (input.name.trim().length > 100) errors.push('Group name must be ≤ 100 characters');
  if (!input.currencyCode.trim()) errors.push('Currency code is required');
  return errors;
}

/**
 * Return the display name for a group member.
 * Falls back to userId if displayName is somehow missing.
 */
export function getMemberDisplayName(member: Member): string {
  return member.displayName;
}

/**
 * Check whether a given userId is a member of a group.
 */
export function isMember(memberships: GroupMembership[], userId: UserId): boolean {
  return memberships.some(
    m => m.member.type === 'user' && m.member.userId === userId,
  );
}

/**
 * Build a displayName lookup map from memberships for balance computation.
 */
export function buildDisplayNameMap(memberships: GroupMembership[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of memberships) {
    const key =
      m.member.type === 'user' ? m.member.userId : m.member.guestId;
    map.set(key, m.member.displayName);
  }
  return map;
}
