const mongoose = require('mongoose');

//mongoose.connect('mongodb://127.0.0.1:27017/FYP-Backend');

const griefJournalSchema = mongoose.Schema({
    textInput: {type: String},
    createdAt: {type: Date, default: Date.now}
})

module.exports = mongoose.model("griefJournal",griefJournalSchema);