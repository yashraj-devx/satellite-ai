/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030712',
          900: '#060B18',
          850: '#0A1124',
          800: '#0E172F',
          750: '#13203E',
          700: '#1B2C52',
          600: '#253E74',
          500: '#385C9F',
        },
        isro: {
          saffron: '#FF6B00',
          amber: '#FFB800',
          blue: '#0088FF',
          navy: '#002B66',
        },
        radar: {
          cyan: '#00F0FF',
          emerald: '#00FFA3',
          lime: '#70FF00',
          magenta: '#FF00A0',
          purple: '#9945FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.4)',
        'glow-saffron': '0 0 25px -5px rgba(255, 107, 0, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(0, 255, 163, 0.4)',
        'glow-subtle': '0 4px 20px 0 rgba(0, 0, 0, 0.5)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'space-radial': 'radial-gradient(circle at 50% 0%, rgba(0, 136, 255, 0.12) 0%, rgba(6, 11, 24, 0.95) 75%)',
        'cyber-grid': 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'radar-sweep': 'sweep 4s linear infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
