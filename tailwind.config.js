/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  safelist: [
    {
      pattern: /(^bg-|^border-)/,
    },
  ],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        heartbeat: {
          '0%': { transform: 'scale(1);' },
          '14%': { transform: 'scale(1.3);' },
          '28%': { transform: 'scale(1);' },
          '42%': { transform: 'scale(1.3);' },
          '70%': { transform: 'scale(1);' },
        },
      },
      animation: {
        wiggle: 'wiggle 2s ease-in-out infinite',
        heartbeat: 'heartbeat 1s',
      },
    },
  },
  plugins: [],
}
