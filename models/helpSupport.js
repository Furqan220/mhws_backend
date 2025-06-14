const mongoose = require('mongoose');

//mongoose.connect('mongodb://127.0.0.1:27017/FYP-Backend');

const faqSchema = new mongoose.Schema({
  question: String,
  answer: String,
});

const helpSupportSchema = new mongoose.Schema({
  faqs: [faqSchema],
  contact: {
    email: String,
    phone: String,
    liveChat: String,
  },
});

module.exports = mongoose.model('helpSupport', helpSupportSchema);
