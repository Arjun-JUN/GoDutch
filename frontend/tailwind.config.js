/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            colors: {
                // Stitch Material You color system
                "primary": "#4e635a",
                "primary-dim": "#42574e",
                "primary-fixed": "#d1e8dd",
                "primary-fixed-dim": "#c3dacf",
                "primary-container": "#d1e8dd",
                "on-primary": "#e6fdf2",
                "on-primary-fixed": "#2f433c",
                "on-primary-fixed-variant": "#4b6057",
                "on-primary-container": "#42564e",
                "secondary": "#5c605d",
                "secondary-dim": "#505452",
                "secondary-fixed": "#e1e3e0",
                "secondary-fixed-dim": "#d2d5d2",
                "secondary-container": "#e1e3e0",
                "on-secondary": "#f7f9f6",
                "on-secondary-fixed": "#3d403e",
                "on-secondary-fixed-variant": "#595c5a",
                "on-secondary-container": "#4f5250",
                "tertiary": "#556445",
                "tertiary-dim": "#49583a",
                "tertiary-fixed": "#e9fad2",
                "tertiary-fixed-dim": "#dbebc4",
                "tertiary-container": "#e9fad2",
                "on-tertiary": "#eeffd7",
                "on-tertiary-fixed": "#404e31",
                "on-tertiary-fixed-variant": "#5c6b4c",
                "on-tertiary-container": "#526042",
                "surface": "#f8faf9",
                "surface-dim": "#cfdddb",
                "surface-bright": "#f8faf9",
                "surface-variant": "#dae5e3",
                "surface-tint": "#4e635a",
                "surface-container-lowest": "#ffffff",
                "surface-container-low": "#f0f4f3",
                "surface-container": "#e9efee",
                "surface-container-high": "#e1eae9",
                "surface-container-highest": "#dae5e3",
                "on-surface": "#2a3434",
                "on-surface-variant": "#576160",
                "background": "#f8faf9",
                "on-background": "#2a3434",
                "outline": "#727d7c",
                "outline-variant": "#a9b4b3",
                "error": "#9f403d",
                "error-dim": "#4e0309",
                "error-container": "#fe8983",
                "on-error": "#fff7f6",
                "on-error-container": "#752121",
                "inverse-surface": "#0b0f0f",
                "inverse-on-surface": "#9b9d9d",
                "inverse-primary": "#e7fff3",
                // shadcn/ui CSS variable compatibility
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            fontFamily: {
                "manrope": ["Manrope", "sans-serif"],
                "headline": ["Manrope", "sans-serif"],
                "body": ["Manrope", "sans-serif"],
                "label": ["Manrope", "sans-serif"],
                "sans": ["Manrope", "sans-serif"],
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'pulse-ring': {
                    '0%': { boxShadow: '0 0 0 0 rgba(78, 99, 90, 0.4)' },
                    '70%': { boxShadow: '0 0 0 15px rgba(78, 99, 90, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(78, 99, 90, 0)' },
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'pulse-ring': 'pulse-ring 2.5s infinite',
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
