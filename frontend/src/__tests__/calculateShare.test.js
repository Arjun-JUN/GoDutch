import { describe, it, expect } from 'vitest';
import { calculateSplitDetails } from '../utils/calculateShare';

describe('calculateSplitDetails', () => {
  const members = [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
    { id: 'u3', name: 'Charlie' },
  ];

  describe('Equal Splitting', () => {
    it('splits equally among all members by default', () => {
      const result = calculateSplitDetails({
        totalAmount: 300,
        splitMode: 'equally',
        members,
      });

      expect(result).toHaveLength(3);
      expect(result[0].amount).toBe(100);
      expect(result[1].amount).toBe(100);
      expect(result[2].amount).toBe(100);
    });

    it('splits equally among selected members only', () => {
      const result = calculateSplitDetails({
        totalAmount: 100,
        splitMode: 'equally',
        members,
        splitBetween: [{ user_id: 'u1' }, { user_id: 'u2' }],
      });

      expect(result).toHaveLength(2);
      expect(result.find((r) => r.user_id === 'u1').amount).toBe(50);
      expect(result.find((r) => r.user_id === 'u2').amount).toBe(50);
      expect(result.find((r) => r.user_id === 'u3')).toBeUndefined();
    });

    it('handles floating point rounding correctly', () => {
      const result = calculateSplitDetails({
        totalAmount: 100,
        splitMode: 'equally',
        members,
      });

      // 100 / 3 = 33.3333... -> 33.33
      expect(result[0].amount).toBe(33.33);
    });
  });

  describe('Unequal Splitting', () => {
    it('uses specified amounts for each member', () => {
      const splitBetween = [
        { user_id: 'u1', amount: 40 },
        { user_id: 'u2', amount: 60 },
      ];
      const result = calculateSplitDetails({
        totalAmount: 100,
        splitMode: 'unequally',
        members,
        splitBetween,
      });

      expect(result).toHaveLength(2);
      expect(result.find((r) => r.user_id === 'u1').amount).toBe(40);
      expect(result.find((r) => r.user_id === 'u2').amount).toBe(60);
    });
  });

  describe('By Shares Splitting', () => {
    it('calculates amounts based on shares ratio', () => {
      const splitBetween = [
        { user_id: 'u1', shares: 2 }, // 2/4 = 50%
        { user_id: 'u2', shares: 1 }, // 1/4 = 25%
        { user_id: 'u3', shares: 1 }, // 1/4 = 25%
      ];
      const result = calculateSplitDetails({
        totalAmount: 400,
        splitMode: 'byshares',
        members,
        splitBetween,
      });

      expect(result.find((r) => r.user_id === 'u1').amount).toBe(200);
      expect(result.find((r) => r.user_id === 'u2').amount).toBe(100);
      expect(result.find((r) => r.user_id === 'u3').amount).toBe(100);
    });
  });

  describe('Item-Based Splitting', () => {
    const items = [
      { id: 1, name: 'Pizza', price: 200, quantity: 1, assigned_to: ['u1', 'u2'] }, // 100 each
      { id: 2, name: 'Drinks', price: 50, quantity: 2, assigned_to: ['u1'] }, // 100 total (50 * 2)
    ];

    it('calculates totals based on item assignments', () => {
      const result = calculateSplitDetails({
        totalAmount: 300,
        splitMode: 'item-based',
        members,
        items,
      });

      // Alice (u1): 100 (Pizza) + 100 (Drinks) = 200
      // Bob (u2): 100 (Pizza) = 100
      // Charlie (u3): 0
      expect(result.find((r) => r.user_id === 'u1').amount).toBe(200);
      expect(result.find((r) => r.user_id === 'u2').amount).toBe(100);
      expect(result.find((r) => r.user_id === 'u3').amount).toBe(0);
    });

    it('handles item-level unequal (custom) splits', () => {
      const customItems = [
        {
          id: 1,
          price: 100,
          quantity: 1,
          assigned_to: ['u1', 'u2'],
          split_type: 'unequal',
          custom_amounts: { u1: 70, u2: 30 },
        },
      ];
      const result = calculateSplitDetails({
        totalAmount: 100,
        splitMode: 'item-based',
        members,
        items: customItems,
      });

      expect(result.find((r) => r.user_id === 'u1').amount).toBe(70);
      expect(result.find((r) => r.user_id === 'u2').amount).toBe(30);
    });

    it('splits equally across all members if no assignments are made', () => {
      const itemsNoAssignment = [{ id: 1, price: 150, quantity: 1, assigned_to: [] }];
      const result = calculateSplitDetails({
        totalAmount: 150,
        splitMode: 'item-based',
        members,
        items: itemsNoAssignment,
      });

      // 150 / 3 members = 50 each
      expect(result.find((r) => r.user_id === 'u1').amount).toBe(50);
      expect(result.find((r) => r.user_id === 'u2').amount).toBe(50);
      expect(result.find((r) => r.user_id === 'u3').amount).toBe(50);
    });
  });
});
