const mongoose = require('mongoose');

//mongoose.connect('mongodb://127.0.0.1:27017/FYP-Backend');

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    mobile: Number
})


module.exports = mongoose.model("user",userSchema);