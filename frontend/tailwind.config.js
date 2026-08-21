/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff5f5',
          100: '#ffe0e0',
          200: '#ffc1c1',
          300: '#ff9494',
          400: '#ff5757',
          500: '#e81c1c',
          600: '#c40001',
          700: '#c40001',
          800: '#a80000',
          900: '#8a0000',
          950: '#5a0000',
          DEFAULT: '#c40001',
        },
        vvcoe: {
          red: '#C40001',
          darkred: '#A80000',
          cream: '#FFFDF2',
          white: '#FFFFFF',
          text: '#222222',
          muted: '#555555',
          border: '#E5E5E5',
        },
        dark: {
          DEFAULT: '#1a1a2e',
          card: '#16213e',
          surface: '#0f3460',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'marquee': 'marquee 20s linear infinite',
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px rgba(196, 0, 1, 0.3)' },
          'to': { boxShadow: '0 0 40px rgba(196, 0, 1, 0.7)' },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      backgroundImage: {
        'circuit-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cg fill='none' stroke='%23C40001' stroke-width='0.5' opacity='0.07'%3E%3Cpath d='M10 10h80v80H10z'/%3E%3Cpath d='M30 10v20h40V10'/%3E%3Cpath d='M10 50h20v30H10'/%3E%3Ccircle cx='10' cy='10' r='3'/%3E%3Ccircle cx='90' cy='90' r='3'/%3E%3Ccircle cx='50' cy='50' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M40 0 L0 0 0 40' fill='none' stroke='%23C40001' stroke-width='0.3' opacity='0.08'/%3E%3C/svg%3E\")",
        'hero-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF2 60%, #fff5f5 100%)',
        'red-gradient': 'linear-gradient(135deg, #C40001 0%, #A80000 100%)',
        'dark-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      },
      boxShadow: {
        'red-sm': '0 2px 8px rgba(196, 0, 1, 0.2)',
        'red-md': '0 4px 20px rgba(196, 0, 1, 0.3)',
        'red-lg': '0 8px 40px rgba(196, 0, 1, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
