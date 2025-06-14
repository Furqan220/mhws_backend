const mongoose = require('mongoose');

//mongoose.connect('mongodb://127.0.0.1:27017/FYP-Backend');

const notificationSchema = new mongoose.Schema({
    deviceToken: { type: String, required: true }, // FCM token
    notificationTime: { type: String, required: true },
    message: { type: String, required: true },
});

module.exports = mongoose.model("notification", notificationSchema);
