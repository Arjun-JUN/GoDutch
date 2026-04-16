export const getCurrencySymbol = (currency: string = 'INR') => {
  const symbols: Record<string, string> = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  return symbols[currency] || '₹';
};

export const EXPENSE_CATEGORIES = [
  'General',
  'Food & Drink',
  'Groceries',
  'Transport',
  'Home',
  'Entertainment',
  'Shopping',
  'Health',
  'Travel',
  'Other'
];

export const getIconForDescription = (desc: string) => {
  const d = desc.toLowerCase();
  if (d.includes('pizza') || d.includes('food') || d.includes('dinner')) return 'utensils';
  if (d.includes('uber') || d.includes('taxi') || d.includes('travel')) return 'car';
  if (d.includes('rent') || d.includes('electricity') || d.includes('water')) return 'home';
  if (d.includes('movie') || d.includes('netflix') || d.includes('game')) return 'play';
  return 'receipt';
};
