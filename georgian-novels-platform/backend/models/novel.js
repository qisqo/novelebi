const mongoose = require('mongoose');

const NovelSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: String,
    coverImage: String, // URL to the image
    genre: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Novel', NovelSchema);