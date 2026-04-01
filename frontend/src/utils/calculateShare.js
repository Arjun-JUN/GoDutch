/**
 * Utility to calculate split details for expenses.
 * Handles equal, custom (unequal/shares), and item-based splitting.
 */

export const calculateSplitDetails = ({
  totalAmount,
  splitMode, // 'equally', 'unequally', 'byshares', 'item-based'
  members,
  splitBetween, // Array of { user_id, amount, shares, assigned_to }
  items = [],
  currentUser,
}) => {
  const total = parseFloat(totalAmount) || 0;
  if (!members || members.length === 0) return [];

  // ─── Equal Split ───
  if (splitMode === 'equally' || splitMode === 'equal') {
    const selectedMembers = splitBetween ? splitBetween.map((s) => s.user_id) : members.map(m => m.id);
    const perPerson = selectedMembers.length > 0 ? total / selectedMembers.length : 0;
    return members
      .filter((m) => selectedMembers.includes(m.id))
      .map((m) => ({
        user_id: m.id,
        user_name: m.name,
        amount: parseFloat(perPerson.toFixed(2)),
      }));
  }

  // ─── Unequal Split / Custom ───
  if (splitMode === 'unequally') {
    return splitBetween.map((s) => {
      const member = members.find((m) => m.id === s.user_id);
      return {
        user_id: s.user_id,
        user_name: member?.name || '',
        amount: parseFloat(s.amount) || 0,
      };
    });
  }

  // ─── By Shares ───
  if (splitMode === 'byshares') {
    const totalShares = splitBetween.reduce((sum, s) => sum + (parseInt(s.shares) || 1), 0);
    return splitBetween.map((s) => {
      const member = members.find((m) => m.id === s.user_id);
      const shareAmount = totalShares > 0 ? ((parseInt(s.shares) || 1) / totalShares) * total : 0;
      return {
        user_id: s.user_id,
        user_name: member?.name || '',
        amount: parseFloat(shareAmount.toFixed(2)),
      };
    });
  }

  // ─── Item-Based Split ───
  if (splitMode === 'item-based') {
    const memberTotals = {};
    members.forEach((m) => (memberTotals[m.id] = 0));
    
    items.forEach((item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 1;
      const subtotal = price * qty;
      const assignedTo = item.assigned_to || [];
      
      if (assignedTo.length > 0) {
        const perPerson = subtotal / assignedTo.length;
        assignedTo.forEach((mid) => {
          if (memberTotals[mid] !== undefined) memberTotals[mid] += perPerson;
        });
      } else {
        // If nobody assigned, split across all members
        const perPerson = subtotal / members.length;
        members.forEach((m) => (memberTotals[m.id] += perPerson));
      }
    });

    return members.map((m) => ({
      user_id: m.id,
      user_name: m.name,
      amount: parseFloat(memberTotals[m.id].toFixed(2)),
    }));
  }

  return [];
};
