/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Slate brand palette — sage, calm, editorial.
        // Keep in sync with src/theme/tokens.ts.
        primary: {
          DEFAULT: '#4e635a',
          strong: '#42564e',
          foreground: '#e6fdf2',
          container: '#d1e8dd',
        },
        foreground: '#2a3434',
        muted: {
          DEFAULT: '#576160',
          subtle: '#727d7c',
        },
        soft: {
          DEFAULT: '#f0f4f3',
          strong: '#d1e8dd',
          highest: '#dae5e3',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.84)',
          solid: '#ffffff',
        },
        border: {
          DEFAULT: 'rgba(169,180,179,0.18)',
          soft: 'rgba(169,180,179,0.14)',
          ghost: 'rgba(169,180,179,0.15)',
        },
        background: {
          start: '#f8faf9',
          end: '#eef3f1',
          top: 'rgba(231,255,243,0.8)',
        },
        danger: {
          DEFAULT: '#9f403d',
          soft: 'rgba(159,64,61,0.1)',
        },
        success: {
          DEFAULT: '#4f7a60',
          soft: 'rgba(79,122,96,0.1)',
        },
        ring: 'rgba(209,232,221,0.8)',
      },
      fontFamily: {
        sans: ['Manrope_400Regular'],
        manrope: ['Manrope_400Regular'],
        'manrope-medium': ['Manrope_500Medium'],
        'manrope-semibold': ['Manrope_600SemiBold'],
        'manrope-bold': ['Manrope_700Bold'],
        'manrope-extrabold': ['Manrope_800ExtraBold'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        'pill': '999px',
      },
      boxShadow: {
        card: '0 16px 40px rgba(42,52,52,0.06)',
        'card-sm': '0 12px 32px rgba(42,52,52,0.05)',
        button: '0 12px 30px rgba(78,99,90,0.22)',
      },
    },
  },
  plugins: [],
};
