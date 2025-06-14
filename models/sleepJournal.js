const mongoose = require('mongoose');

//mongoose.connect('mongodb://127.0.0.1:27017/FYP-Backend');

const sleepJournalSchema = mongoose.Schema({
    rateSleep: {type: Number, min: 1, max: 5},
    createdAt: {type: Date, default: Date.now}
})

module.exports = mongoose.model("sleepJournal",sleepJournalSchema);