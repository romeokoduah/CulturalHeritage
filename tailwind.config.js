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
        // Theme-driven surface scale (flips between dark/light via CSS vars)
        ink: {
          950: 'rgb(var(--ink-950) / <alpha-value>)',
          900: 'rgb(var(--ink-900) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
        },
        // `white` is remapped to the theme foreground so every text-white/xx,
        // bg-white/xx and border-white/xx utility flips automatically.
        white: 'rgb(var(--fg) / <alpha-value>)',
        // Constant near-black for dark text sitting on gold/accent surfaces.
        abyss: '#070a14',
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
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(215deg) translateX(-600px)', opacity: '0' },
        },
        'timeline-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 209, 102, 0.5)' },
          '70%': { boxShadow: '0 0 0 12px rgba(255, 209, 102, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255, 209, 102, 0)' },
        },
        'sparkle-appear': {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1) rotate(90deg)', opacity: '1' },
          '100%': { transform: 'scale(0) rotate(180deg)', opacity: '0' },
        },
        'globe-pin': {
          from: { transform: 'scale(0) translateY(10px)', opacity: '0' },
          to: { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
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
        meteor: 'meteor 5s linear infinite',
        'timeline-pulse': 'timeline-pulse 2s ease-out',
        'sparkle-appear': 'sparkle-appear 1s ease-in-out forwards',
        'globe-pin': 'globe-pin 0.5s ease-out forwards',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
