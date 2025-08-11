const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
    topicId: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    source: {
        type: String,
        enum: ['API', 'LLM', 'USER'],
        default: 'API'
    },
    knowledgeLevel: {
        type: Number,
        min: 0,
        max: 3,
        default: 0
        // 0 = не знаю, 1 = плохо знаю, 2 = немного помню, 3 = хорошо помню
    },
    lastReviewed: {
        type: Date,
        default: null
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    nextReviewDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);