/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ee4d2d',
        secondary: '#00b2ff',
        success: '#00bf5e',
        warning: '#ffc107',
        danger: '#ff4d4f',
      }
    },
  },
  plugins: [],
}