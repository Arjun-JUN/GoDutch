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
  {
    icon: ForkKnife,
    category: 'Food & Dining',
    // Exact-word matches score 2, substring matches score 1
    exact: ['food', 'eat', 'ate', 'meal', 'lunch', 'dinner', 'breakfast', 'brunch', 'snack', 'drinks', 'drink', 'beer', 'wine'],
    partial: ['pizza', 'burger', 'biryani', 'chicken', 'noodle', 'pasta', 'sushi', 'taco', 'sandwich', 'cafe', 'coffee', 'tea', 'chai', 'restaurant', 'diner', 'canteen', 'bakery', 'sweets', 'dessert', 'icecream', 'zomato', 'swiggy', 'dunzo', 'dominos', 'kfc', 'mcdonalds', 'starbucks'],
  },
  {
    icon: Car,
    category: 'Transportation',
    exact: ['cab', 'ride', 'fuel', 'petrol', 'diesel', 'toll', 'parking', 'metro', 'bus', 'auto'],
    partial: ['uber', 'ola', 'rapido', 'taxi', 'rickshaw', 'commute', 'transport', 'vehicle', 'scooter', 'bike', 'ferry', 'shuttle', 'carpool', 'rapido', 'yulu'],
  },
  {
    icon: Ticket,
    category: 'Entertainment',
    exact: ['movie', 'show', 'game', 'event', 'concert', 'gig', 'play', 'match', 'party', 'night out'],
    partial: ['netflix', 'spotify', 'hotstar', 'prime', 'youtube', 'disney', 'hbo', 'cinema', 'theatre', 'bookmyshow', 'pvr', 'inox', 'gaming', 'subscription', 'stream'],
  },
  {
    icon: ShoppingCart,
    category: 'Groceries',
    exact: ['grocery', 'groceries', 'vegetables', 'fruits', 'milk', 'eggs', 'bread', 'rice', 'dal', 'sabzi'],
    partial: ['bigbasket', 'blinkit', 'zepto', 'dmart', 'supermarket', 'kirana', 'provisions', 'ration', 'instamart'],
  },
  {
    icon: ShoppingBag,
    category: 'Shopping',
    exact: ['shopping', 'clothes', 'shoes', 'bag', 'watch', 'gadget', 'electronics', 'gift'],
    partial: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'mall', 'store', 'market', 'purchase', 'order', 'delivery'],
  },
  {
    icon: Lightbulb,
    category: 'Utilities',
    exact: ['electricity', 'water', 'wifi', 'internet', 'phone', 'recharge', 'dth', 'gas', 'maintenance', 'rent', 'deposit'],
    partial: ['broadband', 'airtel', 'jio', 'bsnl', 'bescom', 'tata', 'vodafone', 'bill', 'utility', 'cylinder', 'lpg', 'subscription'],
  },
  {
    icon: Stethoscope,
    category: 'Healthcare',
    exact: ['doctor', 'hospital', 'clinic', 'medicine', 'pharmacy', 'health', 'test', 'scan', 'surgery', 'dental'],
    partial: ['medical', 'pharma', 'apollo', 'medplus', 'netmeds', 'practo', 'checkup', 'vaccination', 'prescription', '1mg', 'lab'],
  },
  {
    icon: Airplane,
    category: 'Travel',
    exact: ['flight', 'hotel', 'trip', 'travel', 'vacation', 'holiday', 'tour', 'visa', 'passport', 'resort'],
    partial: ['airbnb', 'booking', 'makemytrip', 'goibibo', 'oyo', 'indigo', 'spicejet', 'irctc', 'train', 'hostel', 'backpack', 'itinerary'],
  },
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
  const raw = (description || '').toLowerCase().trim();
  if (!raw) return { icon: Receipt, category: 'Other' };

  // Tokenise: split on spaces and common punctuation
  const words = raw.split(/[\s,./&()+\-]+/).filter(Boolean);

  let bestScore = 0;
  let bestEntry = null;

  for (const entry of DESCRIPTION_ICON_MAP) {
    let score = 0;

    // Exact-word hits score 2 each
    for (const kw of entry.exact) {
      if (kw.includes(' ')) {
        // Multi-word phrase — check as substring of original
        if (raw.includes(kw)) score += 3;
      } else {
        if (words.includes(kw)) score += 2;
        else if (raw.includes(kw)) score += 1; // substring fallback
      }
    }

    // Partial/brand hits score 1 each (substring is fine for brand names)
    for (const kw of entry.partial) {
      if (raw.includes(kw)) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  // Only match if score is meaningful (avoids false positives on generic words)
  if (bestScore >= 1 && bestEntry) {
    return { icon: bestEntry.icon, category: bestEntry.category };
  }
  return { icon: Receipt, category: 'Other' };
}
