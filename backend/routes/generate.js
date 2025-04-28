const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Topic = require('../models/Topic');
const Card = require('../models/Card');
const auth = require('../middleware/auth');

// Setup Gemini
const setupGemini = () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Configuration without responseFormat which is causing the error
    const geminiConfig = {
        temperature: 0.2,
        topP: 1,
        topK: 32,
        maxOutputTokens: 4096
    };
    return genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: geminiConfig
    });
};

// Generate flashcards for a topic using Gemini
router.post('/', auth, async (req, res) => {
    try {
        const { topic, count = 10 } = req.body;
        
        if (!topic) {
            return res.status(400).json({ message: 'Тема обязательна' });
        }
        
        // Setup the prompt for Gemini in Russian
        const prompt = `Сгенерируй ${count} карточек для изучения темы "${topic}".
        Каждая карточка должна содержать вопрос ('question') и ответ ('answer').
        Верни карточки ТОЛЬКО как валидный JSON массив объектов.
        Вопросы должны быть сложными, но краткими. Ответы должны быть полными, но прямыми.
        Твой ОТВЕТ ДОЛЖЕН БЫТЬ исключительно валидным JSON массивом, который можно обработать через JSON.parse().
        Пример формата: [{"question": "Столица Франции?", "answer": "Париж"},...]
        
        НЕ включай никаких объяснений, markdown форматирования или другого текста вне JSON массива.
        ВЕРНИ ТОЛЬКО JSON МАССИВ.`;
        
        const model = setupGemini();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        try {
            // Since responseFormat is no longer used, we need to ensure text is valid JSON
            const text = response.text();
            // Try to extract JSON if the response contains other text
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            const jsonText = jsonMatch ? jsonMatch[0] : text;
            
            const cards = JSON.parse(jsonText);
            
            if (!Array.isArray(cards) || cards.length === 0) {
                return res.status(500).json({ 
                    message: 'Сгенерированный контент не является валидным массивом карточек',
                    rawResponse: text
                });
            }
            
            // Return the generated cards without saving to database yet
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

// *** NEW: Explain Answer using Gemini ***
router.post('/explain', auth, async (req, res) => {
    try {
        const { question, answer } = req.body;

        if (!question || !answer) {
            return res.status(400).json({ message: 'Требуются и вопрос, и ответ' });
        }

        // Setup the prompt for Gemini in Russian
        const prompt = `Кратко объясни, почему ответ "${answer}" является правильным для вопроса "${question}". 
        Объяснение должно быть понятным и по существу, не более 2-3 предложений. 
        Избегай прямого повторения вопроса или ответа в начале объяснения. Просто дай объяснение.`;
        
        const model = setupGemini();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const explanationText = response.text();

        res.json({ explanation: explanationText });

    } catch (error) {
        console.error('Ошибка генерации объяснения:', error); // Translate log
        res.status(500).json({ 
            message: 'Ошибка генерации объяснения', // Translate error message
            error: error.message
        });
    }
});

// Save generated cards to a topic
router.post('/save', auth, async (req, res) => {
    try {
        const { topicName, topicDescription, cards } = req.body;
        
        if (!topicName || !Array.isArray(cards) || cards.length === 0) {
            return res.status(400).json({ 
                message: 'Имя темы и непустой массив карточек обязательны'
            });
        }
        
        // Create or find the topic FOR THIS USER
        let topic = await Topic.findOne({ name: topicName, userId: req.userId });
        
        if (!topic) {
            topic = new Topic({
                name: topicName,
                description: topicDescription || `Сгенерированные карточки по теме ${topicName}`,
                userId: req.userId // Associate topic with user
            });
            await topic.save();
        }
        
        // Prepare cards for insertion, adding userId
        const cardsToInsert = cards.map(card => ({
            topicId: topic._id,
            question: card.question,
            answer: card.answer,
            source: 'LLM',
            userId: req.userId // Associate card with user
        }));
        
        // Insert cards
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