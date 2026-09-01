/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Oceanic & Human Palette
        ocean: {
          bg: '#F4FBFC',
          surface: '#EAF7F8',
          soft: '#D9F1F4',
          light: '#8FD3DE',
          medium: '#55B8C7',
          accent: '#2D9FB2',
          hover: '#248696',
          dark: '#163F47',
          muted: '#55777D',
          border: '#C9E5E8',
          card: '#FFFFFF',
        },
        // Soft, Natural Alert Colors (Gentle coral, warm amber, soft sun yellow, sea blue)
        alert: {
          critical: '#E06A60', // Soft coral red
          high: '#E59846',     // Warm amber
          medium: '#D4A017',   // Sunlit ochre
          low: '#4FAEC0',      // Soft sea blue
          success: '#38A882',  // Calm seafoam
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(22, 63, 71, 0.04), 0 1px 3px 0 rgba(22, 63, 71, 0.02)',
        'card': '0 8px 24px -4px rgba(45, 159, 178, 0.08), 0 2px 6px -1px rgba(22, 63, 71, 0.03)',
        'float': '0 16px 36px -8px rgba(45, 159, 178, 0.14), 0 4px 12px -2px rgba(22, 63, 71, 0.04)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}
