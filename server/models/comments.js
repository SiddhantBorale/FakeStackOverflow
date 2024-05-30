const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userID: {required: true, type: mongoose.Schema.Types.ObjectId, ref: 'userID'},
    date: {type: Date, default: Date.now},
    questionID: {type: mongoose.Schema.Types.ObjectId, ref: 'questionID'},
    answerID: {type: mongoose.Schema.Types.ObjectId, ref: 'answerID'},
    text: {type: String, required: true},
    votes: {type: Number, default: 0},
    username: {required: true, type: String, ref: 'username'}
});

commentSchema.virtual('url').get(`/posts/comments/${this._id}`);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;