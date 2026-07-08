/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A', // slate-900
          card: '#1E293B', // slate-800
          border: '#334155', // slate-700
          accent: '#3B82F6', // blue-500
        }
      }
    },
  },
  plugins: [],
}
