/**
 * Utility functions for currency and bill splitting arithmetic.
 */

/**
 * Rounds a number to two decimal places for currency.
 */
export const roundToTwo = (num: number): number => {
  return +(Math.round(+(num + "e+2")) + "e-2");
};

/**
 * Splits an amount into equal parts, returning an array of amounts.
 * Handles remainder by adding it to the first person.
 */
export const splitEqually = (total: number, parts: number): number[] => {
  if (parts <= 0) return [];
  const share = Math.floor((total / parts) * 100) / 100;
  const result = new Array(parts).fill(share);
  
  // Calculate remainder due to precision loss
  const currentTotal = roundToTwo(share * parts);
  const remainder = roundToTwo(total - currentTotal);
  
  if (remainder !== 0) {
    result[0] = roundToTwo(result[0] + remainder);
  }
  
  return result;
};

/**
 * Calculates a percentage share of a total.
 */
export const calculatePercentage = (total: number, percentage: number): number => {
  return roundToTwo((total * percentage) / 100);
};
