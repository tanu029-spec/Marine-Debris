/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a101f',
          800: '#0e172a',
          700: '#16233b',
          600: '#1d2e4a',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        alert: {
          critical: '#ef4444', // red-500
          high: '#f97316',     // orange-500
          medium: '#eab308',   // yellow-500
          low: '#3b82f6',      // blue-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
