import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CURRENCY_SYMBOLS,
  getCurrencySymbol,
  getIconForDescription,
} from '../lib/constants';

describe('constants.js', () => {
  describe('CATEGORIES', () => {
    it('contains 9 categories', () => {
      expect(CATEGORIES).toHaveLength(9);
    });

    it('includes Food & Dining and Other', () => {
      expect(CATEGORIES).toContain('Food & Dining');
      expect(CATEGORIES).toContain('Other');
    });
  });

  describe('CATEGORY_ICONS', () => {
    it('has an icon for every category', () => {
      for (const cat of CATEGORIES) {
        expect(CATEGORY_ICONS[cat]).toBeDefined();
      }
    });

    it('icons are functions (React components)', () => {
      for (const key of Object.keys(CATEGORY_ICONS)) {
        expect(typeof CATEGORY_ICONS[key]).toBe('function');
      }
    });
  });

  describe('getCurrencySymbol', () => {
    it('returns ₹ for INR', () => {
      expect(getCurrencySymbol('INR')).toBe('₹');
    });

    it('returns $ for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
    });

    it('returns the code itself for unknown currency', () => {
      expect(getCurrencySymbol('XYZ')).toBe('XYZ');
    });
  });

  describe('getIconForDescription', () => {
    it('returns ForkKnife icon for food-related descriptions', () => {
      const result = getIconForDescription('pizza dinner');
      expect(result.category).toBe('Food & Dining');
      expect(typeof result.icon).toBe('function');
    });

    it('returns Travel icon for flight description', () => {
      const result = getIconForDescription('IndiGo flight booking');
      expect(result.category).toBe('Travel');
    });

    it('returns Other icon for unrecognised descriptions', () => {
      const result = getIconForDescription('random unknown item');
      expect(result.category).toBe('Other');
    });

    it('handles empty string without throwing', () => {
      const result = getIconForDescription('');
      expect(result.category).toBe('Other');
    });

    it('handles null/undefined without throwing', () => {
      const result = getIconForDescription(null);
      expect(result.category).toBe('Other');
    });

    it('is case-insensitive', () => {
      const result = getIconForDescription('PIZZA');
      expect(result.category).toBe('Food & Dining');
    });
  });
});
