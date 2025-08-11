const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

async function checkTopicOwnerForCards(req, res, next) {
    try {
        const topicId = req.params.topicId || req.body.topicId;
        if (!topicId) {
            return res.status(400).json({ message: 'Topic ID is required' });
        }
        const topic = await Topic.findOne({ _id: topicId, userId: req.userId });
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found or you do not own this topic' });
        }
        req.topic = topic;
        next();
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid topic ID format' });
        }
        console.error('Error checking topic ownership for cards:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function checkCardOwner(req, res, next) {
    try {
        const card = await Card.findOne({ _id: req.params.id, userId: req.userId });
        if (!card) {
            return res.status(404).json({ message: 'Card not found or you do not own this card' });
        }
        req.card = card;
        next();
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid card ID format' });
        }
        console.error('Error checking card ownership:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

router.get('/topic/:topicId', auth, checkTopicOwnerForCards, async (req, res) => {
    try {
        const cards = await Card.find({ 
            topicId: req.params.topicId, 
            userId: req.userId 
        }).sort({ createdAt: -1 });
        res.json(cards);
    } catch (error) {
        console.error('Error fetching user cards for topic:', error);
        res.status(500).json({ message: 'Error fetching cards' });
    }
});

// Получить карточки для изучения с учетом интервального повторения
router.get('/topic/:topicId/study', auth, checkTopicOwnerForCards, async (req, res) => {
    try {
        const currentDate = new Date();
        
        // Получаем все карточки для темы
        const allCards = await Card.find({ 
            topicId: req.params.topicId, 
            userId: req.userId 
        });

        // Функция для расчета приоритета карточки
        const calculatePriority = (card) => {
            const level = card.knowledgeLevel || 0;
            const nextReview = card.nextReviewDate || new Date(0);
            const isOverdue = nextReview <= currentDate;
            
            // Чем меньше уровень знания, тем выше приоритет
            // Просроченные карточки имеют дополнительный приоритет
            let priority = (3 - level) * 10;
            if (isOverdue) priority += 20;
            
            return priority;
        };

        // Сортируем карточки по приоритету
        const sortedCards = allCards.sort((a, b) => {
            return calculatePriority(b) - calculatePriority(a);
        });

        res.json(sortedCards);
    } catch (error) {
        console.error('Error fetching study cards for topic:', error);
        res.status(500).json({ message: 'Error fetching study cards' });
    }
});

router.get('/:id', auth, checkCardOwner, async (req, res) => {
    res.json(req.card);
});

router.post('/', auth, checkTopicOwnerForCards, async (req, res) => {
    try {
        const { topicId, question, answer, source } = req.body;
                
        const newCard = new Card({
            topicId,
            question,
            answer,
            source: source || 'USER',
            userId: req.userId 
        });
        
        const savedCard = await newCard.save();
        res.status(201).json(savedCard);
    } catch (error) {
        console.error('Error creating card:', error);
        res.status(500).json({ message: 'Error creating card' });
    }
});

router.post('/batch', auth, checkTopicOwnerForCards, async (req, res) => {
    try {
        const { topicId, cards, source } = req.body; 
                
        
        if (!Array.isArray(cards) || cards.length === 0) {
            return res.status(400).json({ message: 'Cards array is required and must not be empty' });
        }
        
        
        const cardsToInsert = cards.map(card => ({
            topicId,
            question: card.question,
            answer: card.answer,
            source: source || 'API', 
            userId: req.userId 
        }));
        
        const savedCards = await Card.insertMany(cardsToInsert);
        res.status(201).json(savedCards);
    } catch (error) {
        console.error('Error creating cards in batch:', error);
        res.status(500).json({ message: 'Error creating cards in batch' });
    }
});

router.put('/:id', auth, checkCardOwner, async (req, res) => {
    try {
        const { question, answer } = req.body;
        
        
        req.card.question = question || req.card.question;
        req.card.answer = answer || req.card.answer;
        
        const updatedCard = await req.card.save();
        res.json(updatedCard);
    } catch (error) {
        console.error('Error updating card:', error);
        res.status(500).json({ message: 'Error updating card' });
    }
});

router.delete('/:id', auth, checkCardOwner, async (req, res) => {
    try {
        await Card.deleteOne({ _id: req.params.id, userId: req.userId });
        res.json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error('Error deleting card:', error);
        res.status(500).json({ message: 'Error deleting card' });
    }
});

// Отметить карточку с уровнем знания (0-3)
router.post('/:id/mark', auth, checkCardOwner, async (req, res) => {
    try {
        const { knowledgeLevel } = req.body;
        const cardId = req.params.id;
        const topicId = req.card.topicId;

        // Проверяем уровень знания
        if (knowledgeLevel === undefined || knowledgeLevel < 0 || knowledgeLevel > 3) {
            return res.status(400).json({ message: 'Knowledge level must be between 0 and 3' });
        }

        // Обновляем карточку с новым уровнем знания
        const currentDate = new Date();
        const nextReviewIntervals = [1, 3, 7, 14]; // дни для каждого уровня
        const nextReviewDate = new Date(currentDate.getTime() + nextReviewIntervals[knowledgeLevel] * 24 * 60 * 60 * 1000);

        await Card.findByIdAndUpdate(cardId, {
            knowledgeLevel,
            lastReviewed: currentDate,
            $inc: { reviewCount: 1 },
            nextReviewDate
        });

        // Найти или создать прогресс для темы
        let progressDoc = await Progress.findOne({ 
            userId: req.userId, 
            topicId 
        });
        
        if (!progressDoc) {
            // Создать новый документ прогресса
            progressDoc = new Progress({
                userId: req.userId,
                topicId,
                knownCardIds: [],
                unknownCardIds: [],
            });
        }
        
        // Обновить массивы в зависимости от уровня знания
        if (knowledgeLevel >= 2) { // немного помню или хорошо помню
            progressDoc.knownCardIds.addToSet(cardId);
            progressDoc.unknownCardIds.pull(cardId);
        } else { // не знаю или плохо знаю
            progressDoc.unknownCardIds.addToSet(cardId);
            progressDoc.knownCardIds.pull(cardId);
        }
        
        // Обновить счетчики
        progressDoc.knownCount = progressDoc.knownCardIds.length;
        progressDoc.unknownCount = progressDoc.unknownCardIds.length;
        progressDoc.lastActive = new Date();
        
        const savedProgress = await progressDoc.save();
        
        res.json(savedProgress);
        
    } catch (error) {
        console.error('Error marking card:', error);
        res.status(500).json({ message: 'Error marking card' });
    }
});

module.exports = router;