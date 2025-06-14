const mongoose = require('mongoose');

//mongoose.connect('mongodb://127.0.0.1:27017/FYP-Backend');

const moodJournalSchema = mongoose.Schema({
    rateMood: {type: Number, enum: [1,2,3]},
    feeling: {type: Number, min: 1, max: 8},
    createdAt: {type: Date, default: Date.now}
})

module.exports = mongoose.model("moodJournal",moodJournalSchema);