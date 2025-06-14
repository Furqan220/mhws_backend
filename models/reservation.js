const mongoose = require('mongoose');

//mongoose.connect('mongodb://127.0.0.1:27017/FYP-Backend');

const reservationSchema = mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference by ObjectId
    ref: 'User',                          // Name of the model you are referencing
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('reservation', reservationSchema);
