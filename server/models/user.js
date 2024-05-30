const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true},
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    reputation: {type: Number, default: 0},
    date: {type: Date, default: Date.now()},
    isAdmin: {type: Boolean, default: false}
});

const User = mongoose.model('User', userSchema);

module.exports = User;