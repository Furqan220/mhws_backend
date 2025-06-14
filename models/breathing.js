const mongoose = require('mongoose');

//mongoose.connect('mongodb://127.0.0.1:27017/FYP-Backend');

const breathingExerciseSchema = new mongoose.Schema({
  day: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('breathingExercise', breathingExerciseSchema);
