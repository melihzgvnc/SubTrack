/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF', // Paper
        foreground: '#000000', // Ink
        primary: '#0000FF', // Focus (Hyperlink Blue)
        destructive: '#FF0000', // Alert
        highlight: '#FFFF00', // Highlight
        // Remove old colors to enforce strict adherence
      },
      fontFamily: {
        serif: ['Times New Roman', 'serif'], // Authority
        sans: ['Arial', 'sans-serif'], // Utility
        mono: ['Courier New', 'monospace'], // Data
      },
      borderWidth: {
        DEFAULT: '1px',
      },
      borderRadius: {
        none: '0px', // Enforce sharp corners
        DEFAULT: '0px',
      },
      boxShadow: {
        none: 'none', // No shadows
      }
    },
  },
  plugins: [],
}
