const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const Card = require('../models/Card');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

// Middleware для проверки владения темой
async function checkTopicOwner(req, res, next) {
    try {
        const topic = await Topic.findOne({ _id: req.params.id, userId: req.userId });
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found or you do not own this topic' });
        }
        req.topic = topic; // Прикрепить тему к запросу для последующего использования
        next();
    } catch (error) {
        // Обработать потенциальную ошибку CastError, если формат ID недействителен
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid topic ID format' });
        }
        console.error('Error checking topic ownership:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Получить все темы для вошедшего пользователя
router.get('/', auth, async (req, res) => {
    try {
        const topics = await Topic.find({ userId: req.userId }).sort({ name: 1 });
        res.json(topics);
    } catch (error) {
        console.error('Error fetching user topics:', error);
        res.status(500).json({ message: 'Error fetching topics' });
    }
});

// Получить одну тему по ID (проверить владение)
router.get('/:id', auth, checkTopicOwner, async (req, res) => {
    // Тема прикреплена к req с помощью middleware checkTopicOwner
    res.json(req.topic);
});

// Создать новую тему для вошедшего пользователя
router.post('/', auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const newTopic = new Topic({
            name,
            description,
            userId: req.userId // Связать тему с пользователем
        });
        
        const savedTopic = await newTopic.save();
        res.status(201).json(savedTopic);
    } catch (error) {
        console.error('Error creating topic:', error);
        // Обработать потенциальную ошибку дублирования ключа при необходимости (например, уникальное имя для пользователя)
        res.status(500).json({ message: 'Error creating topic' });
    }
});

// Обновить тему (проверить владение)
router.put('/:id', auth, checkTopicOwner, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // req.topic - это документ темы, найденный checkTopicOwner
        req.topic.name = name || req.topic.name;
        req.topic.description = description !== undefined ? description : req.topic.description;
        
        const updatedTopic = await req.topic.save();
        res.json(updatedTopic);
    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({ message: 'Error updating topic' });
    }
});

// Удалить тему, ее карточки и записи прогресса (проверить владение)
router.delete('/:id', auth, checkTopicOwner, async (req, res) => {
    try {
        const topicId = req.params.id;
        const userId = req.userId;

        // Удалить саму тему
        await Topic.deleteOne({ _id: topicId, userId: userId });
        // Удалить связанные карточки
        await Card.deleteMany({ topicId: topicId, userId: userId });
        // Удалить связанный прогресс
        await Progress.deleteMany({ topicId: topicId, userId: userId });

        res.json({ message: 'Topic and associated data deleted successfully' });

    } catch (error) {
        console.error('Error deleting topic and associated data:', error);
        res.status(500).json({ message: 'Error deleting topic' });
    }
});

module.exports = router; 