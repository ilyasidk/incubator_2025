const path = require('path');
// Загружаем .env только если не в production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const topicsRoutes = require('./routes/topics');
const cardsRoutes = require('./routes/cards');
const progressRoutes = require('./routes/progress');
const generateRoutes = require('./routes/generate');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Basic CORS configuration, adjust as needed
app.use(express.json()); // for parsing application/json

// Serve static files from 'public' directory relative to server.js
app.use(express.static(path.join(__dirname, 'public')));

// Basic Route - Changed to serve index.html
app.get('/', (req, res) => {
  // res.send('Flashcards Master Backend is running!'); // Старый вариант
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Отдаем index.html из папки public
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/generate', generateRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: process.env.NODE_ENV === 'production' ? null : err.message 
  });
});

// DB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 