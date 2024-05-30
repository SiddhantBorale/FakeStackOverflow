// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');

let mongoose = require('mongoose');
let mongoDB = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const cors = require('cors'); 

const app = express();

const questionsController = require('./controllers/questionsController');
const tagController = require('./controllers/tagController');
const ansController = require('./controllers/answerController');
const userAuthController = require('./controllers/userAuthController');
const commentController = require('./controllers/commentController');

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

app.use('/posts/question', questionsController);
app.use('/posts/tag', tagController);
app.use('/posts/answer', ansController);
app.use('/auth', userAuthController);
app.use('/comments', commentController);    

process.on('SIGINT', () => {
    db.close();
    console.log("Server closed. Database instance disconnected");
    process.exit(0);
});

app.listen(8000, () => console.log("Server listening on port 8000"));