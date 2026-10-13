/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          50: '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#e02424',
          500: '#b91c1c',
          600: '#8b0000', // Deep Classic Maroon of Awrora University
          700: '#750000',
          800: '#5e0000',
          900: '#430000',
          950: '#2b0000',
        },
        maroon: {
          50: '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#e02424',
          500: '#b91c1c',
          600: '#8b0000',
          700: '#750000',
          800: '#5e0000',
          900: '#430000',
          950: '#2b0000',
        },
        gold: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
