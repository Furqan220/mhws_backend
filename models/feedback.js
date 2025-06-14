const mongoose = require('mongoose');

//mongoose.connect('mongodb://127.0.0.1:27017/FYP-Backend');

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: false },
  rating: { type: Number, min: 1, max: 5, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
