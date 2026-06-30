/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05060f',
        panel: 'rgba(255,255,255,0.04)',
        // shadcn semantic tokens (HSL CSS vars)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        neon: {
          blue: '#3b82f6',
          cyan: '#22d3ee',
          violet: '#8b5cf6',
          magenta: '#e935c1',
          pink: '#f472b6',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Space Grotesk"', 'Sora', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(139,92,246,0.45)',
        'glow-blue': '0 0 30px rgba(59,130,246,0.45)',
        'glow-magenta': '0 0 40px rgba(233,53,193,0.5)',
        'glow-red': '0 0 50px rgba(239,68,68,0.6)',
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(120deg,#3b82f6 0%,#8b5cf6 45%,#e935c1 100%)',
        'neon-radial': 'radial-gradient(circle at 30% 20%, rgba(139,92,246,0.25), transparent 60%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        floaty: 'floaty 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
