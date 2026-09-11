/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Gloock', 'serif'],
        mono: ['Inter', 'sans-serif'],
        display: ['Gloock', 'serif'],
        gloock: ['Gloock', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        slate: {
          50: '#ffffff',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#404040',
          700: '#1a1a1a',
          800: '#0a0a0a',
          900: '#050505',
          950: '#000000',
        }
      }
    }
  },
  plugins: [],
}
