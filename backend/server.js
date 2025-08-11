const path = require('path');
// Загружаем .env только если не в production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Импорт роутов
const authRoutes = require('./routes/auth');
const topicsRoutes = require('./routes/topics');
const cardsRoutes = require('./routes/cards');
const progressRoutes = require('./routes/progress');


const app = express();
const PORT = process.env.PORT || 8080;

// Промежуточное ПО (Middleware)
app.use(cors()); // Базовая конфигурация CORS, при необходимости измените
app.use(express.json()); // для парсинга application/json

// Отдавать статические файлы из директории 'public' относительно server.js
app.use(express.static(path.join(__dirname, 'public')));

// Базовый роут - Изменен для отдачи index.html
app.get('/', (req, res) => {
  // res.send('Flashcards Master Backend is running!'); // Старый вариант
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Отдаем index.html из папки public
});

// Роуты API
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/progress', progressRoutes);


// Промежуточное ПО для обработки ошибок
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: process.env.NODE_ENV === 'production' ? null : err.message 
  });
});

// Подключение к БД
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 