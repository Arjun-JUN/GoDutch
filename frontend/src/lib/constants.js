import {
  Airplane,
  Car,
  DotsThreeCircle,
  ForkKnife,
  Lightbulb,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  Ticket,
  Receipt
} from '@/slate/icons';

export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Groceries',
  'Utilities',
  'Healthcare',
  'Travel',
  'Other',
];

export const CATEGORY_ICONS = {
  'Food & Dining': ForkKnife,
  'Transportation': Car,
  'Entertainment': Ticket,
  'Shopping': ShoppingBag,
  'Groceries': ShoppingCart,
  'Utilities': Lightbulb,
  'Healthcare': Stethoscope,
  'Travel': Airplane,
  'Other': DotsThreeCircle,
};

export const DESCRIPTION_ICON_MAP = [
  { keywords: ['food', 'pizza', 'burger', 'dinner', 'lunch', 'breakfast', 'restaurant', 'cafe', 'coffee', 'tea', 'biryani', 'chicken', 'noodles'], icon: ForkKnife, category: 'Food & Dining' },
  { keywords: ['uber', 'cab', 'taxi', 'ola', 'gas', 'fuel', 'parking', 'car', 'petrol', 'diesel', 'metro', 'bus'], icon: Car, category: 'Transportation' },
  { keywords: ['movie', 'netflix', 'concert', 'show', 'game', 'spotify', 'hotstar', 'prime'], icon: Ticket, category: 'Entertainment' },
  { keywords: ['grocery', 'supermarket', 'vegetables', 'fruits', 'bigbasket', 'blinkit', 'zepto', 'dmart'], icon: ShoppingCart, category: 'Groceries' },
  { keywords: ['shop', 'amazon', 'flipkart', 'clothes', 'shoes', 'myntra', 'mall'], icon: ShoppingBag, category: 'Shopping' },
  { keywords: ['electricity', 'water', 'internet', 'phone', 'wifi', 'bill', 'broadband', 'bescom'], icon: Lightbulb, category: 'Utilities' },
  { keywords: ['doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'clinic'], icon: Stethoscope, category: 'Healthcare' },
  { keywords: ['flight', 'hotel', 'trip', 'travel', 'vacation', 'airbnb', 'booking', 'train', 'indigo'], icon: Airplane, category: 'Travel' },
];

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export function getCurrencySymbol(code) {
  return CURRENCY_SYMBOLS[code] || code;
}

export function getIconForDescription(description) {
  const lower = (description || '').toLowerCase();
  for (const entry of DESCRIPTION_ICON_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return { icon: entry.icon, category: entry.category };
    }
  }
  return { icon: Receipt, category: 'Other' };
}
