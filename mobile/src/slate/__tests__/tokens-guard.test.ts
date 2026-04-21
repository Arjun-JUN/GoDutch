/**
 * Guard tests for the token set. These lock in the design system's canonical
 * spacing and typography rungs — when a future change tries to add a raw pixel
 * value, these tests force the contributor to add it as a token first (or use
 * the nearest existing rung).
 *
 * Principle: foundational-principles.md → pillar 4, Technical Execution.
 */

import { spacing, typography, radii, colors } from '../../theme/tokens';

describe('spacing tokens — the 4-point grid rungs', () => {
  const canonical = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 88, 136];

  it('every spacing value is a multiple of 4', () => {
    for (const [key, value] of Object.entries(spacing)) {
      expect(value % 4).toBe(0);
    }
  });

  it('every spacing value is in the canonical rung set', () => {
    const actualValues = Object.values(spacing).sort((a, b) => a - b);
    for (const value of actualValues) {
      expect(canonical).toContain(value);
    }
  });

  it('exposes the s12 intermediate rung (row-level gaps)', () => {
    expect(spacing.s12).toBe(12);
  });

  it('exposes the s20 intermediate rung (stat-card padding)', () => {
    expect(spacing.s20).toBe(20);
  });

  it('exposes the s40 intermediate rung (page bottom padding)', () => {
    expect(spacing.s40).toBe(40);
  });

  it('exposes the generous breath rung (88px)', () => {
    expect(spacing.breath).toBe(88);
  });

  it('exposes the large breath rung (136px)', () => {
    expect(spacing.breathLg).toBe(136);
  });
});

describe('typography tokens — editorial hierarchy', () => {
  it('every typography variant has fontSize, lineHeight, letterSpacing', () => {
    for (const variant of Object.values(typography)) {
      expect(variant).toHaveProperty('fontSize');
      expect(variant).toHaveProperty('lineHeight');
      expect(variant).toHaveProperty('letterSpacing');
    }
  });

  it('line-height >= font-size for every variant (readable)', () => {
    for (const variant of Object.values(typography)) {
      expect(variant.lineHeight).toBeGreaterThanOrEqual(variant.fontSize);
    }
  });

  it('display letter-spacing is negative (editorial tightness)', () => {
    expect(typography.display.letterSpacing).toBeLessThan(0);
    expect(typography.displayLg.letterSpacing).toBeLessThan(0);
    expect(typography.titleXl.letterSpacing).toBeLessThan(0);
  });

  it('eyebrow letter-spacing is positive (open tracking for uppercase)', () => {
    expect(typography.eyebrow.letterSpacing).toBeGreaterThan(0);
    expect(typography.eyebrowSm.letterSpacing).toBeGreaterThan(0);
  });

  it('exposes titleSm for row-level merchant names', () => {
    expect(typography.titleSm.fontSize).toBe(17);
  });

  it('exposes amount for inline amounts', () => {
    expect(typography.amount.fontSize).toBe(24);
  });

  it('exposes amountLg for stat-card values', () => {
    expect(typography.amountLg.fontSize).toBe(30);
  });

  it('variants form a monotonic hierarchy', () => {
    // Bigger-is-more-prominent rule.
    expect(typography.displayLg.fontSize).toBeGreaterThan(typography.display.fontSize);
    expect(typography.display.fontSize).toBeGreaterThan(typography.titleXl.fontSize);
    expect(typography.titleXl.fontSize).toBeGreaterThan(typography.titleLg.fontSize);
    expect(typography.titleLg.fontSize).toBeGreaterThan(typography.title.fontSize);
    expect(typography.title.fontSize).toBeGreaterThan(typography.titleSm.fontSize);
    expect(typography.titleSm.fontSize).toBeGreaterThan(typography.body.fontSize);
    expect(typography.body.fontSize).toBeGreaterThan(typography.label.fontSize);
    expect(typography.label.fontSize).toBeGreaterThan(typography.eyebrow.fontSize);
    expect(typography.eyebrow.fontSize).toBeGreaterThan(typography.eyebrowSm.fontSize);
  });
});

describe('radii tokens', () => {
  it('exposes the pill radius (999)', () => {
    expect(radii.pill).toBe(999);
  });

  it('exposes the small radius (2)', () => {
    expect(radii.sm).toBe(2);
  });

  it('no sharp-corner radius (no 0 token)', () => {
    for (const value of Object.values(radii)) {
      expect(value).toBeGreaterThan(0);
    }
  });
});

describe('colors tokens — tonal hierarchy', () => {
  it('exposes the three surface tiers (base, soft, solid)', () => {
    expect(colors.backgroundStart).toBeTruthy();
    expect(colors.soft).toBe('#f0f4f3');
    expect(colors.surfaceSolid).toBe('#ffffff');
  });

  it('exposes the accent pair (primary / primaryStrong)', () => {
    expect(colors.primary).toBeTruthy();
    expect(colors.primaryStrong).toBeTruthy();
    expect(colors.primary).not.toBe(colors.primaryStrong);
  });

  it('exposes accent-soft variants for tonal badges', () => {
    expect(colors.dangerSoft).toBeTruthy();
    expect(colors.successSoft).toBeTruthy();
  });

  it('every color is a string (hex or rgba)', () => {
    for (const value of Object.values(colors)) {
      expect(typeof value).toBe('string');
    }
  });
});
