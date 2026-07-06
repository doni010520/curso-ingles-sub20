/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bahia: {
          blue: '#006CB5',
          'blue-light': '#1a8cd8',
          'blue-dark': '#004d80',
          'blue-deep': '#002d4f',
          red: '#ED3237',
          'red-light': '#ff5a5f',
          gold: '#FEDD22',
          'gold-light': '#fff176',
        },
        bg: {
          dark: '#041428',
          mid: '#071e3a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
