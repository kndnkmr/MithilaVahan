/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand: warm Mithila-inspired palette
        brand: {
          50: '#fdf4ec',
          100: '#f9e2cc',
          500: '#e07a2f',
          600: '#c9611b',
          700: '#a54d14',
        },
      },
    },
  },
  plugins: [],
};
