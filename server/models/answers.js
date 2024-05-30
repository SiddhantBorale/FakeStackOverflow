// Answer Document Schema
let mongoose = require('mongoose');

const ansSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    ans_by: {
        type: String,
        default: "Anonymous",
        required: true
    },
    ans_date: {
        type: Date,
        default: Date.now
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userID',
        required: true
    },
    qID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'qID',
    },
    votes: {
        type: Number,
        ref: 'votes',
        default: 0
    }
});

ansSchema.virtual('url').get(`/posts/answer/${this._id}`);

const Answer = mongoose.model('Answer', ansSchema);

module.exports = Answer;