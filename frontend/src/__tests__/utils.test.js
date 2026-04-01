/**
 * Unit tests for src/lib/utils.js
 *
 * `cn` merges Tailwind class strings, resolving conflicts so the last
 * value wins (e.g. two text-* utilities → the later one is kept).
 */
import { cn } from '../lib/utils';

describe('cn (class name merger)', () => {
  test('returns a single class unchanged', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  test('joins multiple classes', () => {
    const result = cn('flex', 'items-center', 'gap-2');
    expect(result).toBe('flex items-center gap-2');
  });

  test('deduplicates conflicting Tailwind utilities (last wins)', () => {
    // tailwind-merge removes the earlier text-red in favour of text-blue
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  test('filters out falsy values', () => {
    const result = cn('flex', false, null, undefined, '', 'gap-2');
    expect(result).toBe('flex gap-2');
  });

  test('handles conditional object syntax from clsx', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn({ 'bg-blue-500': isActive, 'opacity-50': isDisabled });
    expect(result).toBe('bg-blue-500');
  });

  test('handles array input from clsx', () => {
    const result = cn(['flex', 'items-center']);
    expect(result).toBe('flex items-center');
  });

  test('merges conflicting padding utilities (last wins)', () => {
    const result = cn('px-4', 'px-6');
    expect(result).toBe('px-6');
  });

  test('returns empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  test('returns empty string for all falsy arguments', () => {
    expect(cn(false, null, undefined)).toBe('');
  });

  test('does not remove non-conflicting classes', () => {
    const result = cn('flex', 'text-sm', 'font-bold', 'rounded');
    ['flex', 'text-sm', 'font-bold', 'rounded'].forEach((cls) =>
      expect(result).toContain(cls)
    );
  });
});
