import { roundToTwo, splitEqually } from './arithmetic';

export type SplitMode = 'equally' | 'unequally' | 'byshares' | 'item-based';

export interface Participant {
  id: string;
  name: string;
}

export interface SplitBetweenItem {
  user_id: string;
  amount?: number | string;
  shares?: number | string;
}

export interface LineItem {
  name: string;
  price: string | number;
  quantity: string | number;
  assigned_to?: string[];
  split_type?: 'equal' | 'unequal';
  custom_amounts?: Record<string, string | number>;
}

export interface ExpenseSplitDetail {
  user_id: string;
  user_name: string;
  amount: number;
}

interface SplitParams {
  totalAmount: string | number;
  splitMode: SplitMode;
  members: Participant[];
  splitBetween?: SplitBetweenItem[];
  items?: LineItem[];
}

/**
 * Utility to calculate split details for expenses.
 * Handles equal, custom (unequal/shares), and item-based splitting.
 * Ported from calculateShare.js with enhanced precision.
 */
export const calculateSplitDetails = ({
  totalAmount,
  splitMode,
  members,
  splitBetween = [],
  items = [],
}: SplitParams): ExpenseSplitDetail[] => {
  const total = parseFloat(totalAmount.toString()) || 0;
  if (!members || members.length === 0) return [];

  // --- Equal Split ---
  if (splitMode === 'equally' || (splitMode as string) === 'equal') {
    const selectedIds = splitBetween.length > 0 
      ? splitBetween.map((s) => s.user_id) 
      : members.map((m) => m.id);
    
    const count = selectedIds.length;
    if (count === 0) return [];

    const amounts = splitEqually(total, count);
    
    return members
      .filter((m) => selectedIds.includes(m.id))
      .map((m, idx) => ({
        user_id: m.id,
        user_name: m.name,
        amount: amounts[idx],
      }));
  }

  // --- Unequal Split ---
  if (splitMode === 'unequally') {
    return splitBetween.map((s) => {
      const member = members.find((m) => m.id === s.user_id);
      return {
        user_id: s.user_id,
        user_name: member?.name || '',
        amount: roundToTwo(parseFloat(s.amount?.toString() || '0') || 0),
      };
    });
  }

  // --- By Shares ---
  if (splitMode === 'byshares') {
    const getShare = (s: SplitBetweenItem) => {
      const val = s.shares;
      if (val === undefined || val === null || val === '') return 1;
      return parseFloat(val.toString()) || 0;
    };

    const totalShares = splitBetween.reduce((sum, s) => sum + getShare(s), 0);
    
    if (totalShares === 0) {
      return splitBetween.map(s => ({
        user_id: s.user_id,
        user_name: members.find(m => m.id === s.user_id)?.name || '',
        amount: 0
      }));
    }

    return splitBetween.map((s) => {
      const member = members.find((m) => m.id === s.user_id);
      const share = getShare(s);
      return {
        user_id: s.user_id,
        user_name: member?.name || '',
        amount: roundToTwo((share / totalShares) * total),
      };
    });
  }

  // --- Item-Based Split ---
  if (splitMode === 'item-based' || (splitMode as string) === 'item_based') {
    const memberTotals: Record<string, number> = {};
    members.forEach((m) => (memberTotals[m.id] = 0));

    items.forEach((item) => {
      const price = parseFloat(item.price.toString()) || 0;
      const qty = parseInt(item.quantity.toString()) || 1;
      const subtotal = price * qty;
      const assignedTo = item.assigned_to || [];
      const itemSplitType = item.split_type || 'equal';

      if (assignedTo.length > 0) {
        if (itemSplitType === 'unequal' || (itemSplitType as string) === 'custom') {
          const customAmounts = item.custom_amounts || {};
          assignedTo.forEach((mid) => {
            const amt = parseFloat(customAmounts[mid]?.toString() || '0') || 0;
            if (memberTotals[mid] !== undefined) {
              memberTotals[mid] += amt;
            }
          });
        } else {
          const amounts = splitEqually(subtotal, assignedTo.length);
          assignedTo.forEach((mid, idx) => {
            if (memberTotals[mid] !== undefined) {
              memberTotals[mid] += amounts[idx];
            }
          });
        }
      } else {
        const amounts = splitEqually(subtotal, members.length);
        members.forEach((m, idx) => {
          memberTotals[m.id] += amounts[idx];
        });
      }
    });

    return members.map((m) => ({
      user_id: m.id,
      user_name: m.name,
      amount: roundToTwo(memberTotals[m.id]),
    }));
  }

  return [];
};
