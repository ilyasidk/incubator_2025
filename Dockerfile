# Dockerfile для проекта Incubator 2025
# Этап 1: Сборка Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /usr/src/frontend

# Копирование файлов package* frontend и установка зависимостей
COPY frontend/package*.json ./
RUN npm ci

# Копирование остального исходного кода frontend
COPY frontend/ .

# Сборка frontend (генерация CSS, копирование ассетов в dist)
RUN npm run build

# Этап 2: Сборка Backend
FROM node:18-alpine AS backend-builder

WORKDIR /usr/src/backend

# Копирование файлов package* backend и установка только production зависимостей
COPY ./backend/package*.json ./
RUN npm ci --only=production

# Копирование остального исходного кода backend
COPY ./backend/ .

# Финальный этап: Объединение Frontend и Backend
FROM node:18-alpine

WORKDIR /usr/src/app

# Сначала копирование файлов package* из backend-builder
COPY --from=backend-builder /usr/src/backend/package*.json ./

# Установка production зависимостей прямо в финальном образе
RUN npm ci --only=production

# Копирование остального кода backend (исключая node_modules)
# Примечание: Мы копируем '.' из builder, который содержит все.
# Мы полагаемся на то, что предыдущая команда npm ci создала здесь node_modules,
# и потенциально перезаписала node_modules из копии, если они существовали.
# Возможно, более безопасный способ - явно перечислить, что копировать,
# но это распространенная практика.
COPY --from=backend-builder /usr/src/backend . 

# Копирование собранных ассетов frontend из frontend-builder в директорию public
COPY --from=frontend-builder /usr/src/frontend/dist ./public

# Открытие порта, на котором работает приложение (Cloud Run установит его через переменную окружения PORT)
EXPOSE 8080

# Запуск backend сервера (который также будет отдавать frontend)
CMD ["node", "server.js"] 