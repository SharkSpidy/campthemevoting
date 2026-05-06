/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#fefdf0',
          100: '#fdf9d0',
          200: '#fbf0a0',
          300: '#f8e060',
          400: '#f5cc28',
          500: '#e8b800',
          600: '#c99500',
          700: '#a07000',
          800: '#7a5200',
          900: '#5c3d00',
        },
        stone: {
          950: '#0c0a08',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
