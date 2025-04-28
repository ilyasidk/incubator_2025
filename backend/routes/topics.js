const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const Card = require('../models/Card');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

// Middleware to check topic ownership
async function checkTopicOwner(req, res, next) {
    try {
        const topic = await Topic.findOne({ _id: req.params.id, userId: req.userId });
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found or you do not own this topic' });
        }
        req.topic = topic; // Attach topic to request for later use
        next();
    } catch (error) {
        // Handle potential CastError if ID format is invalid
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid topic ID format' });
        }
        console.error('Error checking topic ownership:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Get all topics for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const topics = await Topic.find({ userId: req.userId }).sort({ name: 1 });
        res.json(topics);
    } catch (error) {
        console.error('Error fetching user topics:', error);
        res.status(500).json({ message: 'Error fetching topics' });
    }
});

// Get a single topic by ID (verify ownership)
router.get('/:id', auth, checkTopicOwner, async (req, res) => {
    // Topic is attached to req by checkTopicOwner middleware
    res.json(req.topic);
});

// Create a new topic for the logged-in user
router.post('/', auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const newTopic = new Topic({
            name,
            description,
            userId: req.userId // Associate topic with the user
        });
        
        const savedTopic = await newTopic.save();
        res.status(201).json(savedTopic);
    } catch (error) {
        console.error('Error creating topic:', error);
        // Handle potential duplicate key error if needed (e.g., unique name per user)
        res.status(500).json({ message: 'Error creating topic' });
    }
});

// Update a topic (verify ownership)
router.put('/:id', auth, checkTopicOwner, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // req.topic is the topic document found by checkTopicOwner
        req.topic.name = name || req.topic.name;
        req.topic.description = description !== undefined ? description : req.topic.description;
        
        const updatedTopic = await req.topic.save();
        res.json(updatedTopic);
    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({ message: 'Error updating topic' });
    }
});

// Delete a topic, its cards, and its progress records (verify ownership)
router.delete('/:id', auth, checkTopicOwner, async (req, res) => {
    try {
        const topicId = req.params.id;
        const userId = req.userId;

        // Delete the topic itself
        await Topic.deleteOne({ _id: topicId, userId: userId });
        // Delete associated cards
        await Card.deleteMany({ topicId: topicId, userId: userId });
        // Delete associated progress
        await Progress.deleteMany({ topicId: topicId, userId: userId });

        res.json({ message: 'Topic and associated data deleted successfully' });

    } catch (error) {
        console.error('Error deleting topic and associated data:', error);
        res.status(500).json({ message: 'Error deleting topic' });
    }
});

module.exports = router; 