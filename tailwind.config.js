/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Responsive breakpoints for NativeWind
      screens: {
        'sm': '375px',   // Small phones (iPhone SE)
        'md': '414px',   // Standard phones (iPhone 14)
        'lg': '768px',   // Tablets
        'xl': '1024px',  // Large tablets / iPad Pro
      },
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
        sans: ['System', 'sans-serif'],           // Body text (San Francisco on iOS)
        display: ['ConcertOne_400Regular'],       // Headings and display text
      },
      // Responsive spacing scale
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
