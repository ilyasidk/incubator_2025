# Dockerfile для сборки с корневым контекстом (.)
# Stage 1: Build frontend assets
FROM node:18-alpine AS frontend-builder
WORKDIR /usr/src/frontend
# Копируем только package файлы сначала для кеширования зависимостей
COPY frontend/package*.json ./
# Устанавливаем зависимости фронтенда (включая devDependencies для сборки)
RUN npm install
# Копируем остальной код фронтенда
COPY frontend/ ./
# Собираем CSS
RUN npm run build:css

# Stage 2: Build backend and package frontend assets
FROM node:18-alpine
WORKDIR /usr/src/app

# Копируем package файлы бэкенда из корневого контекста
COPY backend/package.json backend/package-lock.json ./
# Устанавливаем ТОЛЬКО production зависимости бэкенда
RUN npm ci --only=production

# Создаем папку для статики и копируем собранный фронтенд из Этапа 1
RUN mkdir public
COPY --from=frontend-builder /usr/src/frontend/index.html ./public/
COPY --from=frontend-builder /usr/src/frontend/dashboard.html ./public/
COPY --from=frontend-builder /usr/src/frontend/script.js ./public/
COPY --from=frontend-builder /usr/src/frontend/dashboard.js ./public/
COPY --from=frontend-builder /usr/src/frontend/src/generator.js ./public/
COPY --from=frontend-builder /usr/src/frontend/style.css ./public/

# Копируем остальной код бэкенда из корневого контекста
COPY backend/ ./

# Порт, который слушает приложение (Cloud Run использует $PORT)
EXPOSE 8080

# Устанавливаем окружение для продакшена
ENV NODE_ENV production

# Команда для запуска приложения
CMD [ "node", "server.js" ] 