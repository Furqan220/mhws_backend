const mongoose = require('mongoose');

//mongoose.connect('mongodb://127.0.0.1:27017/FYP-Backend');

const imageSchema = new mongoose.Schema({
    moodValue: {
        type: Number,
        required: true,
        unique: true // Only one image per mood level
    },
    imageData: {
        type: Buffer,
        required: true
    },
    contentType: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('image', imageSchema);
