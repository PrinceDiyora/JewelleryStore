/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pearl: '#F2F3F0',
        ink: '#1D1A20',
        mist: '#DCDFDA',
        garnet: { DEFAULT: '#6E1F34', dark: '#531526', soft: '#F3E6EA' },
        gold: { DEFAULT: '#A97C2F', soft: '#F4EAD3' },
        night: '#241018',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
