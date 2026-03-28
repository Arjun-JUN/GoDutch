export const palette = {
  // Brand — electric blue
  brand50: '#EFF6FF',
  brand100: '#DBEAFE',
  brand200: '#BFDBFE',
  brand300: '#93C5FD',
  brand400: '#60A5FA',
  brand500: '#3B82F6',
  brand600: '#2563EB',
  brand700: '#1D4ED8',
  brand800: '#1E40AF',
  brand900: '#1E3A8A',

  // Positive — emerald green (you are owed money)
  positive50: '#ECFDF5',
  positive100: '#D1FAE5',
  positive200: '#A7F3D0',
  positive300: '#6EE7B7',
  positive400: '#34D399',
  positive500: '#10B981',
  positive600: '#059669',
  positive700: '#047857',

  // Negative — red (you owe money)
  negative50: '#FEF2F2',
  negative100: '#FEE2E2',
  negative200: '#FECACA',
  negative300: '#FCA5A5',
  negative400: '#F87171',
  negative500: '#EF4444',
  negative600: '#DC2626',
  negative700: '#B91C1C',

  // Warning — amber (low-confidence fields, caution states)
  warning50: '#FFFBEB',
  warning100: '#FEF3C7',
  warning200: '#FDE68A',
  warning300: '#FCD34D',
  warning400: '#FBBF24',
  warning500: '#F59E0B',
  warning600: '#D97706',
  warning700: '#B45309',

  // Neutrals
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Dark mode surfaces
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate100: '#F1F5F9',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorPalette = typeof palette;
export type PaletteKey = keyof ColorPalette;
