const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const progressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topicId: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    knownCount: {
        type: Number,
        default: 0
    },
    unknownCount: {
        type: Number,
        default: 0
    },
    knownCardIds: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'Card' 
        }
    ],
    unknownCardIds: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'Card' 
        }
    ],
    lastActive: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // Добавляет поля createdAt и updatedAt

// Составной индекс: один пользователь - одна запись прогресса на тему
progressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema); 