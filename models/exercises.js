const mongoose = require('mongoose');

//mongoose.connect('mongodb://127.0.0.1:27017/FYP-Backend');

const exerciseSchema = mongoose.Schema({
    title: String,
    objective: String,
    category: String,
    instructions: String,
})

module.exports = mongoose.model("exercises",exerciseSchema);