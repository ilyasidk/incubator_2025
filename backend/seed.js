require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Topic = require('./models/Topic');
const Card = require('./models/Card');
const Progress = require('./models/Progress');

// Sample data
const sampleTopicsData = [
    {
        name: 'JavaScript Basics',
        description: 'Fundamental concepts of JavaScript programming language'
    },
    {
        name: 'World Capitals',
        description: 'Capital cities of countries around the world'
    }
];

const sampleCardsData = {
    'JavaScript Basics': [
        {
            question: 'What is a closure in JavaScript?',
            answer: 'A closure is a function that has access to its own scope, the scope of the outer function, and the global scope.',
            source: 'API'
        },
        {
            question: 'What is the difference between let and var?',
            answer: 'var is function-scoped while let is block-scoped. Variables declared with var are hoisted to the top of their scope.',
            source: 'API'
        },
        {
            question: 'What is the purpose of the "use strict" directive?',
            answer: 'It enables strict mode, which catches common coding mistakes and prevents unsafe actions. It makes debugging easier.',
            source: 'API'
        },
        {
            question: 'What is a Promise in JavaScript?',
            answer: 'A Promise is an object representing the eventual completion or failure of an asynchronous operation.',
            source: 'API'
        },
        {
            question: 'What is the difference between == and === operators?',
            answer: '== compares values with type coercion, while === compares both values and types without coercion.',
            source: 'API'
        }
    ],
    'World Capitals': [
        {
            question: 'What is the capital of France?',
            answer: 'Paris',
            source: 'API'
        },
        {
            question: 'What is the capital of Japan?',
            answer: 'Tokyo',
            source: 'API'
        },
        {
            question: 'What is the capital of Brazil?',
            answer: 'Brasília',
            source: 'API'
        },
        {
            question: 'What is the capital of Australia?',
            answer: 'Canberra',
            source: 'API'
        },
        {
            question: 'What is the capital of Egypt?',
            answer: 'Cairo',
            source: 'API'
        }
    ]
};

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to MongoDB');
        
        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Topic.deleteMany({});
        await Card.deleteMany({});
        await Progress.deleteMany({});
        console.log('Cleared existing data');
        
        // Create test user
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
        
        // Create topics and cards FOR THE TEST USER
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
        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the seed function
seedDatabase(); 