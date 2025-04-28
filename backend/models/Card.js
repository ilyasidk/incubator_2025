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
    }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);