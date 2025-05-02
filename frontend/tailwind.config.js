module.exports = {
  content: [
    "./*.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Включить JS-файлы из папки src
  ],
  theme: {
    extend: {
      colors: {
        // Определите пользовательские цвета здесь
        primary: {
          DEFAULT: '#3B82F6', // Пример: Синий 500
          dark: '#2563EB',    // Пример: Синий 600 для наведения/фокуса
        },
        // При необходимости можно добавить другие пользовательские цвета
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Пример: Установка Inter как шрифта sans-serif по умолчанию
      },
    },
  },
  plugins: [],
} 