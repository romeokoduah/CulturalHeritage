/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#070a14',
          900: '#0b1020',
          800: '#111834',
          700: '#1a2348',
        },
        gold: {
          300: '#ffe6a3',
          400: '#ffd166',
          500: '#f4b942',
        },
        jade: {
          400: '#4ade80',
          500: '#22c55e',
        },
        clay: {
          400: '#f97362',
          500: '#e5533d',
        },
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'shimmer-slide': {
          to: { transform: 'translate(calc(100cqw - 100%), 0)' },
        },
        'spin-around': {
          '0%': { transform: 'translateZ(0) rotate(0)' },
          '15%, 35%': { transform: 'translateZ(0) rotate(90deg)' },
          '65%, 85%': { transform: 'translateZ(0) rotate(270deg)' },
          '100%': { transform: 'translateZ(0) rotate(360deg)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'border-beam': {
          '100%': { 'offset-distance': '100%' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
        'shimmer-slide': 'shimmer-slide var(--speed, 3s) ease-in-out infinite alternate',
        'spin-around': 'spin-around calc(var(--speed, 3s) * 2) infinite linear',
        marquee: 'marquee var(--duration, 30s) linear infinite',
        float: 'float 4s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4,0,0.2,1) infinite',
      },
    },
  },
  plugins: [],
}
