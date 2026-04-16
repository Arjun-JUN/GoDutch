import { calculateSplitDetails, Participant, SplitBetweenItem, LineItem } from '../splitting';

describe('calculateSplitDetails', () => {
  const members: Participant[] = [
    { id: '1', name: 'Arjun' },
    { id: '2', name: 'Priya' },
    { id: '3', name: 'Rahul' },
  ];

  describe('Equal Splitting', () => {
    it('splits Rs 100 between 3 people correctly (handling remainder)', () => {
      const result = calculateSplitDetails({
        totalAmount: 100,
        splitMode: 'equally',
        members,
      });

      expect(result).toHaveLength(3);
      const sum = result.reduce((acc, r) => acc + r.amount, 0);
      expect(sum).toBe(100.0);
      
      // Remainder logic check: one person should have 33.34, others 33.33
      const amounts = result.map(r => r.amount).sort();
      expect(amounts).toEqual([33.33, 33.33, 33.34]);
    });

    it('splits Rs 100 between 2 selected people only', () => {
      const splitBetween: SplitBetweenItem[] = [
        { user_id: '1' },
        { user_id: '2' },
      ];
      const result = calculateSplitDetails({
        totalAmount: 100,
        splitMode: 'equally',
        members,
        splitBetween,
      });

      expect(result).toHaveLength(2);
      expect(result.find(r => r.user_id === '3')).toBeUndefined();
      expect(result[0].amount).toBe(50);
      expect(result[1].amount).toBe(50);
    });
  });

  describe('Unequal Splitting', () => {
    it('applies explicit amounts to each participant', () => {
      const splitBetween: SplitBetweenItem[] = [
        { user_id: '1', amount: 40.50 },
        { user_id: '2', amount: 59.50 },
      ];
      const result = calculateSplitDetails({
        totalAmount: 100,
        splitMode: 'unequally',
        members,
        splitBetween,
      });

      expect(result).toHaveLength(2);
      expect(result.find(r => r.user_id === '1')?.amount).toBe(40.50);
      expect(result.find(r => r.user_id === '2')?.amount).toBe(59.50);
    });
  });

  describe('Shares Splitting', () => {
    it('splits based on share ratios', () => {
      const splitBetween: SplitBetweenItem[] = [
        { user_id: '1', shares: 2 }, // 2/3
        { user_id: '2', shares: 1 }, // 1/3
      ];
      const result = calculateSplitDetails({
        totalAmount: 90,
        splitMode: 'byshares',
        members,
        splitBetween,
      });

      expect(result.find(r => r.user_id === '1')?.amount).toBe(60);
      expect(result.find(r => r.user_id === '2')?.amount).toBe(30);
    });

    it('handles zero total shares gracefully', () => {
      const splitBetween: SplitBetweenItem[] = [
        { user_id: '1', shares: 0 },
        { user_id: '2', shares: 0 },
      ];
      const result = calculateSplitDetails({
        totalAmount: 90,
        splitMode: 'byshares',
        members,
        splitBetween,
      });

      expect(result[0].amount).toBe(0);
      expect(result[1].amount).toBe(0);
    });
  });

  describe('Item-Based Splitting', () => {
    const items: LineItem[] = [
      { name: 'Pizza', price: 600, quantity: 1, assigned_to: ['1', '2'] }, // 300 each
      { name: 'Coke', price: 50, quantity: 2, assigned_to: ['1'] }, // 100 for Arjun
    ];

    it('calculates total based on assigned items', () => {
      const result = calculateSplitDetails({
        totalAmount: 700,
        splitMode: 'item-based',
        members,
        items,
      });

      // Arjun: 300 (Pizza) + 100 (Coke) = 400
      // Priya: 300 (Pizza) = 300
      // Rahul: 0
      expect(result.find(r => r.user_id === '1')?.amount).toBe(400);
      expect(result.find(r => r.user_id === '2')?.amount).toBe(300);
      expect(result.find(r => r.user_id === '3')?.amount).toBe(0);
    });

    it('splits items unequally if specified', () => {
      const itemsUnequal: LineItem[] = [
        { 
          name: 'Fancy Dinner', 
          price: 1000, 
          quantity: 1, 
          assigned_to: ['1', '2'], 
          split_type: 'unequal',
          custom_amounts: { '1': 700, '2': 300 }
        },
      ];
      const result = calculateSplitDetails({
        totalAmount: 1000,
        splitMode: 'item-based',
        members,
        items: itemsUnequal,
      });

      expect(result.find(r => r.user_id === '1')?.amount).toBe(700);
      expect(result.find(r => r.user_id === '2')?.amount).toBe(300);
    });

    it('splits items equally among ALL members if nobody is assigned', () => {
      const itemsAll: LineItem[] = [
        { name: 'Service Charge', price: 90, quantity: 1 }, 
      ];
      const result = calculateSplitDetails({
        totalAmount: 90,
        splitMode: 'item-based',
        members,
        items: itemsAll,
      });

      expect(result.every(r => r.amount === 30)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('returns empty array if no members provided', () => {
      const result = calculateSplitDetails({
        totalAmount: 100,
        splitMode: 'equally',
        members: [],
      });
      expect(result).toEqual([]);
    });

    it('handles zero total amount', () => {
      const result = calculateSplitDetails({
        totalAmount: 0,
        splitMode: 'equally',
        members,
      });
      expect(result.every(r => r.amount === 0)).toBe(true);
    });
  });
});
