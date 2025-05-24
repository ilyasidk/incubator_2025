# Инструкция по настройке Flashcards Master

## 🚨 ВАЖНО: Настройка переменных окружения

Для корректной работы приложения необходимо создать файл `.env` в папке `backend/` со следующими переменными:

### 1. Создайте файл `backend/.env`

```bash
# Конфигурация базы данных MongoDB
MONGODB_URI=mongodb://localhost:27017/flashcards
# Или используйте MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/flashcards

# Порт сервера
PORT=8080

# JWT секретный ключ (измените на свой собственный!)
JWT_SECRET=ваш_супер_секретный_jwt_ключ_измените_это_в_продакшене

# Google Gemini API ключ (обязательно!)
GEMINI_API_KEY=ваш_gemini_api_ключ_здесь

# Окружение
NODE_ENV=development
```

### 2. Получение Google Gemini API ключа

1. Перейдите на https://aistudio.google.com/app/apikey
2. Войдите в Google аккаунт
3. Создайте новый API ключ
4. Скопируйте ключ и вставьте в переменную `GEMINI_API_KEY`

### 3. Настройка MongoDB

**Локальная установка:**
- Скачайте и установите MongoDB Community Edition
- Запустите MongoDB сервис
- Используйте URI: `mongodb://localhost:27017/flashcards`

**Или используйте MongoDB Atlas (облачное решение):**
1. Зарегистрируйтесь на https://cloud.mongodb.com/
2. Создайте бесплатный кластер
3. Получите строку подключения
4. Замените `MONGODB_URI` на вашу строку подключения

## 🚀 Запуск проекта

### Запуск Backend (Порт 8080)
```bash
cd backend
npm install
npm start
# или для разработки: npm run dev
```

### Запуск Frontend (Порт 3000)
```bash
cd frontend  
npm install
npm start
```

## 🔧 Решение проблем

### Ошибка 500 в `/api/generate`
- ✅ **РЕШЕНО**: Убедитесь, что `GEMINI_API_KEY` настроен в `.env`
- ✅ **РЕШЕНО**: Проверьте, что ключ не содержит значение по умолчанию

### Ошибка 405 Method Not Allowed
- ✅ **РЕШЕНО**: Backend запущен на порту 8080
- ✅ **РЕШЕНО**: Frontend настроен для запросов на `http://localhost:8080/api`

### CORS ошибки
- Backend настроен для приема запросов от frontend
- Убедитесь, что оба сервера запущены

## 📝 Структура портов

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **MongoDB**: localhost:27017 (по умолчанию)

## 🔐 Безопасность

⚠️ **НИКОГДА НЕ КОММИТЬТЕ файл `.env` в git!**

Файл `.env` уже добавлен в `.gitignore`, но убедитесь, что ваши секретные ключи остаются приватными.

## 🎯 Первые шаги после настройки

1. Запустите backend: `cd backend && npm start`
2. Запустите frontend: `cd frontend && npm start` 
3. Откройте http://localhost:3000 в браузере
4. Зарегистрируйтесь или войдите в систему
5. Создайте тему и попробуйте сгенерировать карточки!

## 🆘 Если что-то не работает

1. Проверьте консоль браузера на ошибки JavaScript
2. Проверьте терминал backend на ошибки сервера
3. Убедитесь, что все переменные в `.env` заполнены корректно
4. Перезапустите оба сервера 