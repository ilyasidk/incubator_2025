require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Topic = require('./models/Topic');
const Card = require('./models/Card');
const Progress = require('./models/Progress');

// Пример данных
const sampleTopicsData = [
    {
        name: 'Основы JavaScript',
        description: 'Фундаментальные концепции языка программирования JavaScript'
    },
    {
        name: 'Столицы мира',
        description: 'Столицы стран мира'
    }
];

const sampleCardsData = {
    'Основы JavaScript': [
        {
            question: 'Что такое замыкание в JavaScript?',
            answer: 'Замыкание - это функция, имеющая доступ к своей области видимости, области видимости внешней функции и глобальной области видимости.',
            source: 'API'
        },
        {
            question: 'В чем разница между let и var?',
            answer: 'var имеет функциональную область видимости, а let - блочную. Переменные, объявленные с помощью var, "поднимаются" (hoisted) в начало своей области видимости.',
            source: 'API'
        },
        {
            question: 'Какова цель директивы "use strict"?',
            answer: 'Она включает строгий режим, который отлавливает распространенные ошибки кодирования и предотвращает небезопасные действия. Это облегчает отладку.',
            source: 'API'
        },
        {
            question: 'Что такое Promise в JavaScript?',
            answer: 'Promise - это объект, представляющий конечное завершение или неудачу асинхронной операции.',
            source: 'API'
        },
        {
            question: 'В чем разница между операторами == и ===?',
            answer: '== сравнивает значения с приведением типов, тогда как === сравнивает и значения, и типы без приведения.',
            source: 'API'
        }
    ],
    'Столицы мира': [
        {
            question: 'Какая столица Франции?',
            answer: 'Париж',
            source: 'API'
        },
        {
            question: 'Какая столица Японии?',
            answer: 'Токио',
            source: 'API'
        },
        {
            question: 'Какая столица Бразилии?',
            answer: 'Бразилиа',
            source: 'API'
        },
        {
            question: 'Какая столица Австралии?',
            answer: 'Канберра',
            source: 'API'
        },
        {
            question: 'Какая столица Египта?',
            answer: 'Каир',
            source: 'API'
        }
    ]
};

async function seedDatabase() {
    try {
        // Подключение к MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to MongoDB');
        
        // Очистка существующих данных
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Topic.deleteMany({});
        await Card.deleteMany({});
        await Progress.deleteMany({});
        console.log('Cleared existing data');
        
        // Создание тестового пользователя
        console.log('Creating test user...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);
        const user = new User({
            email: 'test@example.com',
            passwordHash
        });
        
        await user.save();
        const userId = user._id;
        console.log(`Created test user: ${user.email} (password: password123) with ID: ${userId}`);
        
        // Создание тем и карточек ДЛЯ ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ
        console.log('Creating topics and cards for test user...');
        for (const topicData of sampleTopicsData) {
            const topic = new Topic({
                ...topicData,
                userId: userId
            });
            
            await topic.save();
            const topicId = topic._id;
            
            const topicCardsData = sampleCardsData[topicData.name];
            if (topicCardsData && topicCardsData.length > 0) {
                const cardsToInsert = topicCardsData.map(card => ({
                    ...card,
                    topicId: topicId,
                    userId: userId
                }));
                
                await Card.insertMany(cardsToInsert);
                console.log(`Created topic "${topicData.name}" with ${topicCardsData.length} cards for user ${userId}`);
            }
        }
        
        console.log('Database seeded successfully');
        
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Закрытие соединения
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Запуск функции заполнения
seedDatabase(); 