import {
  validateCreateGroup,
  isMember,
  buildDisplayNameMap,
} from './index';
import type { GroupMembership } from '@godutch/commons';
import { asUserId, asGuestId, asGroupId } from '@godutch/commons';
import type { UserId, GuestId } from '@godutch/commons';

const uid = (s: string): UserId => asUserId(s);
const gid = (s: string): GuestId => asGuestId(s);
const testGroupId = asGroupId('g1');

function makeUserMembership(userId: string, displayName: string): GroupMembership {
  return {
    groupId: testGroupId,
    member: { type: 'user', userId: uid(userId), displayName },
    joinedAt: '2026-01-01T00:00:00Z',
  };
}

function makeGuestMembership(guestId: string, displayName: string): GroupMembership {
  return {
    groupId: testGroupId,
    member: { type: 'guest', guestId: gid(guestId), displayName },
    joinedAt: '2026-01-01T00:00:00Z',
  };
}

describe('validateCreateGroup', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('returns no errors for a valid group', () => {
    const errors = validateCreateGroup({
      name: 'Weekend Trip',
      currencyCode: 'USD',
      createdBy: uid('alice'),
    });
    expect(errors).toHaveLength(0);
  });

  it('accepts a name at exactly 100 characters', () => {
    const errors = validateCreateGroup({
      name: 'a'.repeat(100),
      currencyCode: 'USD',
      createdBy: uid('alice'),
    });
    expect(errors).toHaveLength(0);
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('returns error for empty name', () => {
    const errors = validateCreateGroup({
      name: '',
      currencyCode: 'USD',
      createdBy: uid('alice'),
    });
    expect(errors).toContain('Group name is required');
  });

  it('returns error for whitespace-only name', () => {
    const errors = validateCreateGroup({
      name: '   ',
      currencyCode: 'USD',
      createdBy: uid('alice'),
    });
    expect(errors).toContain('Group name is required');
  });

  it('returns error for name exceeding 100 characters', () => {
    const errors = validateCreateGroup({
      name: 'a'.repeat(101),
      currencyCode: 'USD',
      createdBy: uid('alice'),
    });
    expect(errors).toContain('Group name must be ≤ 100 characters');
  });

  it('returns error for empty currencyCode', () => {
    const errors = validateCreateGroup({
      name: 'Trip',
      currencyCode: '',
      createdBy: uid('alice'),
    });
    expect(errors).toContain('Currency code is required');
  });

  it('returns multiple errors when both name and currency are invalid', () => {
    const errors = validateCreateGroup({
      name: '',
      currencyCode: '',
      createdBy: uid('alice'),
    });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('trims name before length check', () => {
    // "  a  " has 5 chars but trims to 1 — should pass
    const errors = validateCreateGroup({
      name: '  a  ',
      currencyCode: 'USD',
      createdBy: uid('alice'),
    });
    expect(errors).toHaveLength(0);
  });
});

describe('isMember', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('returns true for a registered member', () => {
    const memberships = [makeUserMembership('alice', 'Alice')];
    expect(isMember(memberships, uid('alice'))).toBe(true);
  });

  it('returns false for a non-member', () => {
    const memberships = [makeUserMembership('alice', 'Alice')];
    expect(isMember(memberships, uid('bob'))).toBe(false);
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('returns false for empty memberships array', () => {
    expect(isMember([], uid('alice'))).toBe(false);
  });

  it('does not match guests as registered users', () => {
    // A guest with the same string ID as a userId should not match
    const memberships = [makeGuestMembership('alice', 'Alice Guest')];
    expect(isMember(memberships, uid('alice'))).toBe(false);
  });
});

describe('buildDisplayNameMap', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('maps userId to displayName for registered members', () => {
    const map = buildDisplayNameMap([makeUserMembership('alice', 'Alice')]);
    expect(map.get('alice')).toBe('Alice');
  });

  it('maps guestId to displayName for guests', () => {
    const map = buildDisplayNameMap([makeGuestMembership('guest_1', 'Bob Guest')]);
    expect(map.get('guest_1')).toBe('Bob Guest');
  });

  it('handles mixed registered and guest members', () => {
    const map = buildDisplayNameMap([
      makeUserMembership('alice', 'Alice'),
      makeGuestMembership('guest_1', 'Bob'),
    ]);
    expect(map.size).toBe(2);
    expect(map.get('alice')).toBe('Alice');
    expect(map.get('guest_1')).toBe('Bob');
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('returns empty map for no memberships', () => {
    expect(buildDisplayNameMap([])).toEqual(new Map());
  });
});
