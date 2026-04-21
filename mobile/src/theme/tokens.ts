/**
 * Slate design tokens — single source of truth for places Tailwind classes don't reach
 * (status bar color, tab bar tint, gradient stops, BlurView fallback tint, Reanimated
 * color interpolations). Keep in sync with tailwind.config.js.
 */

export const colors = {
  primary: '#4e635a',
  primaryStrong: '#42564e',
  primaryForeground: '#e6fdf2',
  primaryContainer: '#d1e8dd',

  foreground: '#2a3434',
  muted: '#576160',
  mutedSubtle: '#727d7c',

  soft: '#f0f4f3',
  softStrong: '#d1e8dd',
  softHighest: '#dae5e3',

  surface: 'rgba(255,255,255,0.84)',
  surfaceSolid: '#ffffff',

  border: 'rgba(169,180,179,0.18)',
  borderSoft: 'rgba(169,180,179,0.14)',
  borderGhost: 'rgba(169,180,179,0.15)',

  backgroundStart: '#f8faf9',
  backgroundEnd: '#eef3f1',
  backgroundTop: 'rgba(231,255,243,0.8)',

  danger: '#9f403d',
  dangerSoft: 'rgba(159,64,61,0.1)',
  success: '#4f7a60',
  successSoft: 'rgba(79,122,96,0.1)',

  ring: 'rgba(209,232,221,0.8)',

  // Neutral greys (used sparingly — prefer muted/foreground)
  white: '#ffffff',
  black: '#000000',
} as const;

export const gradients = {
  primary: [colors.primary, colors.primaryStrong] as [string, string],
  background: [colors.backgroundStart, colors.backgroundEnd] as [string, string],
};

export const shadows = {
  card: {
    shadowColor: '#2a3434',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 4,
  },
  cardSm: {
    shadowColor: '#2a3434',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 32,
    elevation: 3,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 6,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  // Intermediate rung — matches Tailwind `gap-3`. Use for row-level gaps (expense list,
  // dashboard quick actions). Preferred over sm↔md when sm is too tight and md too loose.
  s12: 12,
  md: 16,
  // Intermediate rung between md and lg. Use for stat card padding and hero-action gaps.
  s20: 20,
  lg: 24,
  xl: 32,
  // Intermediate rung between xl and 2xl. Use for page bottom padding under content.
  s40: 40,
  '2xl': 48,
  '3xl': 64,
  // "Generous breath" per DESIGN_RULES/user-interface/guides/spacing-and-rhythm.md
  breath: 88, // ~5.5rem
  breathLg: 136, // ~8.5rem
};

export const radii = {
  sm: 2,
  md: 12,
  lg: 20,
  xl: 28,
  '2xl': 32,
  pill: 999,
};

export const typography = {
  // Editorial voice — tight letter-spacing, size-first hierarchy.
  displayLg: { fontSize: 44, lineHeight: 48, letterSpacing: -1.2 },
  display: { fontSize: 36, lineHeight: 40, letterSpacing: -1.0 },
  titleXl: { fontSize: 28, lineHeight: 32, letterSpacing: -0.5 },
  titleLg: { fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  title: { fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  // Row-level merchant / list title between body and title.
  titleSm: { fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, letterSpacing: -0.1 },
  label: { fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  eyebrow: { fontSize: 11, lineHeight: 14, letterSpacing: 2.4 },
  // Micro-eyebrow for compact row labels ("YOUR SHARE" in ExpenseCard).
  eyebrowSm: { fontSize: 10, lineHeight: 14, letterSpacing: 1.5 },
  // Inline amount display (expense rows, settlement rows).
  amount: { fontSize: 24, lineHeight: 28, letterSpacing: -0.8 },
  // Stat-card amount display (dashboard balance, totals).
  amountLg: { fontSize: 30, lineHeight: 34, letterSpacing: -1.0 },
};
