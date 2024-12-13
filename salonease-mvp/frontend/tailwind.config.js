const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F3F7',
          100: '#E8E2ED',
          200: '#D1C5DB',
          300: '#B9A8C9',
          400: '#8B6BA5',
          500: '#341146',
          600: '#2D0F3E',
          700: '#260C35',
          800: '#1E092B',
          900: '#170722',
        },
        secondary: {
          50: '#F7F5F9',
          100: '#EFEAF2',
          200: '#DFD5E6',
          300: '#CFB8D9',
          400: '#8E71A3',
          500: '#6D4F86',
          600: '#5D4372',
          700: '#4E385F',
          800: '#3E2C4C',
          900: '#2F2139',
        },
        accent: {
          50: '#FEF2F7',
          100: '#FDE6F0',
          200: '#FBCCE1',
          300: '#F8B3D2',
          400: '#F386BC',
          500: '#ED5DA7',
          600: '#EA086A',
          700: '#D1075F',
          800: '#B8064F',
          900: '#9F0540',
        },
        background: '#F9FAFB',
        text: '#1F2937',
        gray: {
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      maxWidth: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
      boxShadow: {
        'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
