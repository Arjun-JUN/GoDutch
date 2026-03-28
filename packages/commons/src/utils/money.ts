import type { Currency, Money } from '../types/money';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  INR: '₹',
  JPY: '¥',
  SGD: 'S$',
};

/** Convert a decimal amount to integer cents. $10.50 → 1050 */
export function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Convert integer cents to a decimal amount. 1050 → 10.50 */
export function centsToAmount(cents: number): number {
  return cents / 100;
}

/** Format cents for display: 1050, 'USD' → '$10.50' */
export function formatCurrency(cents: number, currency: Currency): string {
  const amount = centsToAmount(cents);
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  // JPY has no decimal places
  const decimals = currency === 'JPY' ? 0 : 2;
  return `${symbol}${Math.abs(amount).toFixed(decimals)}`;
}

/** Format with sign: -1050 → '-$10.50', 1050 → '+$10.50' (use for balance display) */
export function formatCurrencyWithSign(cents: number, currency: Currency): string {
  const formatted = formatCurrency(Math.abs(cents), currency);
  if (cents === 0) return formatted;
  return cents > 0 ? `+${formatted}` : `-${formatted}`;
}

/** Add two Money values. Must have the same currency. */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return { amountCents: a.amountCents + b.amountCents, currency: a.currency };
}

/**
 * Distribute totalCents across N participants evenly.
 * Odd cents go to the first participants in the array.
 * e.g. 1000 / 3 → [334, 333, 333]
 */
export function distributeCentsEvenly(totalCents: number, count: number): number[] {
  if (count <= 0) throw new Error('count must be > 0');
  const base = Math.floor(totalCents / count);
  const remainder = totalCents % count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

/** Round a cents value to the nearest integer (should already be an integer, but safety) */
export function roundMoney(cents: number): number {
  return Math.round(cents);
}

export function makeMoney(cents: number, currency: Currency): Money {
  return { amountCents: Math.round(cents), currency };
}
