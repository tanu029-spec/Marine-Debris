/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HAVSANS Primary Backgrounds
        marine: {
          950: '#050E10',
          900: '#071417',
          850: '#091B1F',
          800: '#0D2328',
          750: '#0E2930',
        },
        // Secondary Surfaces
        surface: {
          900: '#102A30',
          800: '#14353B',
          700: '#183D43',
          600: '#1E4A52',
        },
        // Ocean Blue
        ocean: {
          900: '#0B5263',
          800: '#126579',
          700: '#167A91',
          600: '#1C93AF',
        },
        // Accent Cyan
        cyan: {
          300: '#63E3F0',
          400: '#42D7E8',
          500: '#26C6DA',
          600: '#0EA5B7',
          muted: '#8DBBC1',
          dim: '#386B74',
        },
        // Text Colors
        marineText: {
          primary: '#F4F8F8',
          secondary: '#A8BEC2',
          muted: '#71898D',
          dim: '#476266',
        },
        // Alert Accents
        alert: {
          critical: '#F87171', // soft red
          high: '#FB923C',     // soft amber/orange
          medium: '#FACC15',   // soft yellow
          low: '#38BDF8',      // soft sky blue
          success: '#34D399',  // emerald
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      letterSpacing: {
        widest: '.2em',
        ultra: '.28em',
      },
      borderColor: {
        marine: 'rgba(141, 187, 193, 0.15)',
        'marine-bright': 'rgba(66, 215, 232, 0.35)',
      }
    },
  },
  plugins: [],
}
