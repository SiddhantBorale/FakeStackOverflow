// Question Document Schema
let mongoose = require('mongoose');

const Tag = require('./tags');
const Answer = require('./answers');

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    text: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    tags: {
        type:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
        required: true
    },
    asked_by: {
        type: String,
        default: "Anonymous"
    },
    answers: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
        default: []
    },
    ask_date_time: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    },
    votes: {type: Number, default: 0},   
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userID',
        required: true
    }
});

questionSchema.virtual('url').get(`/posts/question/${this._id}`);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;