/**
 * Money is always stored as integer cents internally.
 * $10.50 → amountCents: 1050
 * This prevents floating-point accumulation errors across splits.
 */
export type Money = {
  amountCents: number;
  currency: Currency;
};

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR' | 'JPY' | 'SGD';

export const DEFAULT_CURRENCY: Currency = 'USD';
