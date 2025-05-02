const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Topic = require('../models/Topic');
const auth = require('../middleware/auth');

// Получить весь прогресс текущего пользователя
router.get('/', auth, async (req, res) => {
    try {
        const progress = await Progress.find({ userId: req.userId })
            .populate('topicId', 'name description') // Добавить детали темы
            .sort({ lastActive: -1 });
        
        res.json(progress);
    } catch (error) {
        console.error('Ошибка получения прогресса:', error);
        res.status(500).json({ message: 'Ошибка получения прогресса' });
    }
});

// Получить прогресс по конкретной теме для текущего пользователя
router.get('/topic/:topicId', auth, async (req, res) => {
    try {
        const { topicId } = req.params;
        
        // Проверка существования темы
        const topic = await Topic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Тема не найдена' });
        }
        
        // Найти существующий прогресс или вернуть пустой шаблон
        let progress = await Progress.findOne({ 
            userId: req.userId, 
            topicId 
        }).populate('topicId', 'name description');
        
        // Если прогресс не найден, вернуть шаблон по умолчанию (не сохраняя)
        if (!progress) {
            progress = {
                userId: req.userId,
                topicId: {
                    _id: topicId,
                    name: topic.name,
                    description: topic.description
                },
                knownCount: 0,
                unknownCount: 0,
                lastActive: new Date()
            };
        }
        
        res.json(progress);
    } catch (error) {
        console.error('Ошибка получения прогресса по теме:', error);
        res.status(500).json({ message: 'Ошибка получения прогресса по теме' });
    }
});

// Обновить прогресс по теме (создать, если нет)
router.post('/topic/:topicId', auth, async (req, res) => {
    try {
        const { topicId } = req.params;
        const { cardId, status } = req.body; // Ожидается cardId и status ('known' или 'unknown')
        
        if (!cardId || !status || !['known', 'unknown'].includes(status)) {
            return res.status(400).json({ message: 'Требуется cardId и status (known/unknown)' });
        }
        
        // Закомментированная проверка существования темы
        // const topic = await Topic.findById(topicId); // Получить тему
        // if (!topic) { // Если тема не найдена
        //     return res.status(404).json({ message: 'Тема не найдена' });
        // }
        
        let progressDoc = await Progress.findOne({ 
            userId: req.userId, 
            topicId 
        });
        
        if (!progressDoc) {
            // Создать новый документ прогресса, если он не существует
            progressDoc = new Progress({
                userId: req.userId,
                topicId,
                knownCardIds: [],
                unknownCardIds: [],
            });
        }
        
        // Обновить массивы в зависимости от статуса
        if (status === 'known') {
            progressDoc.knownCardIds.addToSet(cardId); // Добавить в "знаю"
            progressDoc.unknownCardIds.pull(cardId);   // Удалить из "не знаю"
        } else { // status === 'unknown' // если статус "не знаю"
            progressDoc.unknownCardIds.addToSet(cardId); // Добавить в "не знаю"
            progressDoc.knownCardIds.pull(cardId);     // Удалить из "знаю"
        }
        
        // Обновить счетчики на основе длины массивов
        progressDoc.knownCount = progressDoc.knownCardIds.length;
        progressDoc.unknownCount = progressDoc.unknownCardIds.length;
        
        progressDoc.lastActive = new Date();
        
        const savedProgress = await progressDoc.save();
        
        // Вернуть обновленный прогресс с данными темы
        const responseProgress = await Progress.findById(savedProgress._id)
                                      .populate('topicId', 'name description'); // Добавить детали темы
                                      
        res.json(responseProgress);

    } catch (error) {
        console.error('Ошибка обновления прогресса:', error);
        res.status(500).json({ message: 'Ошибка обновления прогресса' });
    }
});

// Сбросить прогресс по теме
router.delete('/topic/:topicId', auth, async (req, res) => {
    try {
        const { topicId } = req.params;
        
        // Найти и удалить прогресс
        const deletedProgress = await Progress.findOneAndDelete({ 
            userId: req.userId, 
            topicId 
        });
        
        if (!deletedProgress) {
            return res.status(404).json({ message: 'Прогресс по этой теме не найден' });
        }
        
        res.json({ message: 'Прогресс успешно сброшен' });
    } catch (error) {
        console.error('Ошибка сброса прогресса:', error);
        res.status(500).json({ message: 'Ошибка сброса прогресса' });
    }
});

module.exports = router; 