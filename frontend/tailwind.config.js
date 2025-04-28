module.exports = {
  content: [
    "./*.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include JS files in src folder
  ],
  theme: {
    extend: {
      colors: {
        // Define custom colors here
        primary: {
          DEFAULT: '#3B82F6', // Example: Blue 500
          dark: '#2563EB',    // Example: Blue 600 for hover/focus
        },
        // You can add other custom colors if needed
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Example: Setting Inter as default sans-serif font
      },
    },
  },
  plugins: [],
} 