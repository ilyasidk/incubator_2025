# Dockerfile для сборки с контекстом backend/
# Зависимости и переменные окружения
FROM node:18-alpine
WORKDIR /usr/src/app

# Копируем package файлы бэкенда из текущей директории
COPY package.json package-lock.json ./
# Устанавливаем ТОЛЬКО production зависимости бэкенда
RUN npm ci --only=production

# Создаем пустую папку public с минимальной структурой 
# для обхода ошибок при отсутствии файлов фронтенда
RUN mkdir -p public
RUN echo '<!DOCTYPE html><html><head><title>Flashcards Master</title></head><body><h1>Flashcards Master Backend</h1><p>Frontend files will be added later.</p></body></html>' > public/index.html
RUN echo '<!DOCTYPE html><html><head><title>Dashboard</title></head><body><h1>Dashboard</h1><p>Dashboard will be added later.</p></body></html>' > public/dashboard.html
RUN touch public/script.js
RUN touch public/dashboard.js
RUN mkdir -p public/src
RUN touch public/src/generator.js
RUN touch public/style.css

# Копируем остальной код бэкенда из текущей директории
COPY . .

# Порт, который слушает приложение (Cloud Run использует $PORT)
EXPOSE 8080

# Устанавливаем окружение для продакшена
ENV NODE_ENV production

# Команда для запуска приложения
CMD [ "node", "server.js" ] 