/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // "class": dark: styles apply while <html> has the class "dark"
  // (toggled by src/components/ThemeToggle.jsx)
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
