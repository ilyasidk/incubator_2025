const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Topic = require('../models/Topic');
const Card = require('../models/Card');
const auth = require('../middleware/auth');

// Функция retry с экспоненциальной задержкой для обхода rate limits
const retryWithDelay = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (error.status === 429 && i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i);
                console.log(`Rate limit hit, waiting ${delay}ms before retry ${i + 1}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
};

// Настройка Gemini
const setupGemini = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY не настроен в переменных окружения. Пожалуйста, получите API ключ на https://aistudio.google.com/app/apikey и добавьте его в файл .env');
    }
    
    if (apiKey === 'your_gemini_api_key_here') {
        throw new Error('GEMINI_API_KEY содержит значение по умолчанию. Пожалуйста, замените его на ваш настоящий API ключ от Google AI Studio');
    }
    
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Конфигурация без responseFormat, вызывающего ошибку
        const geminiConfig = {
            temperature: 0.2,
            topP: 1,
            topK: 32,
            maxOutputTokens: 4096
        };
        return genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: geminiConfig
        });
    } catch (error) {
        throw new Error(`Ошибка инициализации Gemini AI: ${error.message}. Проверьте корректность GEMINI_API_KEY`);
    }
};

// Генерация карточек для темы с помощью Gemini
router.post('/', auth, async (req, res) => {
    try {
        const { topic, count = 10 } = req.body;
        
        if (!topic) {
            return res.status(400).json({ message: 'Тема обязательна' });
        }
        
        // Настройка промпта для Gemini на русском
        const prompt = `Сгенерируй ${count} карточек для изучения темы "${topic}".
        Каждая карточка должна содержать вопрос ('question') и ответ ('answer').
        Верни карточки ТОЛЬКО как валидный JSON массив объектов.
        Вопросы должны быть сложными, но краткими. Ответы должны быть полными, но прямыми.
        Твой ОТВЕТ ДОЛЖЕН БЫТЬ исключительно валидным JSON массивом, который можно обработать через JSON.parse().
        Пример формата: [{"question": "Столица Франции?", "answer": "Париж"},...]
        
        НЕ включай никаких объяснений, markdown форматирования или другого текста вне JSON массива.
        ВЕРНИ ТОЛЬКО JSON МАССИВ.`;
        
                const model = setupGemini();        const result = await retryWithDelay(() => model.generateContent(prompt));        const response = await result.response;                try {            // Поскольку responseFormat больше не используется, нужно убедиться, что текст является валидным JSON
            const text = response.text();
            // Попытаться извлечь JSON, если ответ содержит другой текст
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            const jsonText = jsonMatch ? jsonMatch[0] : text;
            
            const cards = JSON.parse(jsonText);
            
            if (!Array.isArray(cards) || cards.length === 0) {
                return res.status(500).json({ 
                    message: 'Сгенерированный контент не является валидным массивом карточек',
                    rawResponse: text
                });
            }
            
            // Вернуть сгенерированные карточки без сохранения в БД
            res.json({
                topic,
                cards: cards.map(card => ({
                    question: card.question,
                    answer: card.answer
                }))
            });
        } catch (error) {
            console.error('!!! Ошибка парсинга сгенерированных карточек:', error);
            console.error('Получен сырой текст от Gemini:', response.text());
            return res.status(500).json({ 
                message: 'Ошибка парсинга сгенерированных карточек',
                rawResponse: response.text(),
                error: error.message
            });
        }
    } catch (error) {
        console.error('Ошибка генерации карточек:', error);
        res.status(500).json({ 
            message: 'Ошибка генерации карточек',
            error: error.message
        });
    }
});

// *** НОВОЕ: Объяснение ответа с помощью Gemini ***
router.post('/explain', auth, async (req, res) => {
    try {
        const { question, answer } = req.body;

        if (!question || !answer) {
            return res.status(400).json({ message: 'Требуются и вопрос, и ответ' });
        }

        // Настройка промпта для Gemini на русском
        const prompt = `Кратко объясни, почему ответ "${answer}" является правильным для вопроса "${question}". 
        Объяснение должно быть понятным и по существу, не более 2-3 предложений. 
        Избегай прямого повторения вопроса или ответа в начале объяснения. Просто дай объяснение.`;
        
                const model = setupGemini();        const result = await retryWithDelay(() => model.generateContent(prompt));        const response = await result.response;        const explanationText = response.text();

        res.json({ explanation: explanationText });

    } catch (error) {
        console.error('Ошибка генерации объяснения:', error);
        res.status(500).json({ 
            message: 'Ошибка генерации объяснения',
            error: error.message
        });
    }
});

// Сохранение сгенерированных карточек в тему
router.post('/save', auth, async (req, res) => {
    try {
        const { topicName, topicDescription, cards } = req.body;
        
        if (!topicName || !Array.isArray(cards) || cards.length === 0) {
            return res.status(400).json({ 
                message: 'Имя темы и непустой массив карточек обязательны'
            });
        }
        
        // Создать или найти тему ДЛЯ ЭТОГО ПОЛЬЗОВАТЕЛЯ
        let topic = await Topic.findOne({ name: topicName, userId: req.userId });
        
        if (!topic) {
            topic = new Topic({
                name: topicName,
                description: topicDescription || `Сгенерированные карточки по теме ${topicName}`,
                userId: req.userId // Связать тему с пользователем
            });
            await topic.save();
        }
        
        // Подготовить карточки для вставки, добавив userId
        const cardsToInsert = cards.map(card => ({
            topicId: topic._id,
            question: card.question,
            answer: card.answer,
            source: 'LLM',
            userId: req.userId // Связать карточку с пользователем
        }));
        
        // Вставить карточки
        const savedCards = await Card.insertMany(cardsToInsert);
        
        res.status(201).json({
            topic,
            cards: savedCards,
            message: `Успешно сохранено ${savedCards.length} карточек в тему "${topicName}"`
        });
        
    } catch (error) {
        console.error('Ошибка сохранения сгенерированных карточек:', error);
        res.status(500).json({ 
            message: 'Ошибка сохранения сгенерированных карточек',
            error: error.message
        });
    }
});

module.exports = router; 