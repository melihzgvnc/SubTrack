/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#09090B', // Dark background for contrast with mesh
        surface: 'rgba(255, 255, 255, 0.05)', // Glassy surface
        'surface-highlight': 'rgba(255, 255, 255, 0.1)',
        'neon-pink': '#FFB5E8',
        'neon-blue': '#B5DEFF',
        'neon-green': '#B5FFCD',
        'neon-purple': '#E7B5FF',
        'shadow-blue-grey': '#64748B',
      },
      fontFamily: {
        sans: ['System', 'sans-serif'], // Use system font (San Francisco on iOS)
      },
    },
  },
  plugins: [],
}
