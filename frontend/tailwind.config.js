/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          2: 'hsl(var(--surface-2))'
        },
        signal: {
          DEFAULT: 'hsl(var(--signal))',
          bright: 'hsl(var(--signal-bright))'
        },
        ice: 'hsl(var(--ice))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'Instrument Sans',
          'system-ui',
          '-apple-system',
          'sans-serif'
        ],
        display: [
          'var(--font-display)',
          'Bricolage Grotesque',
          'var(--font-sans)',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          'var(--font-mono)',
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'monospace'
        ]
      },
      fontSize: {
        'mega': ['clamp(2.75rem, 6.4vw + 0.5rem, 6rem)', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        'display': ['clamp(2.5rem, 6vw + 0.5rem, 5.5rem)', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(2rem, 4vw + 0.5rem, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'section': ['clamp(1.75rem, 2.6vw + 0.75rem, 2.85rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }]
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 16px)'
      },
      maxWidth: {
        '8xl': '90rem'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both'
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
