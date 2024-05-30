const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const express = require('express');

let User = require('../models/user');
let Comment = require('../models/comments');

const dotenv = require('dotenv');
dotenv.config();

const jwtSecretKey = process.env.JWT_KEY || 'default-key';

const router = express.Router();

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send("Access denied. No token provided.");
    }
    try {
        const decoded = jwt.verify(token, jwtSecretKey);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        res.status(403).send("Invalid token.");
    }
};


router.get('/getQuestion/:qid', async(req, res) => {
    const {qid} = req.params;
    const comments = await Comment.find({questionID: qid});
    if (comments) {
        res.status(200).json(comments);
    } else {
        res.status(404).send("Comment not found");
    }
});

router.get('/answer/:aid', async(req, res) => {
    const {aid} = req.params;
    const comments = await Comment.find({answerID:aid});
    if (comments) {
        res.status(200).json(comments);
    } else {
        res.status(404).send("Comment not found");
    }
});

router.post('/addcomment', verifyToken, async(req, res) => {
    try {
        const { questionID, answerID, text } = req.body;

        console.log("qid: ", questionID);
        console.log("aid: ", answerID);

        const { id, email } = req.user;
        const user = await User.findById(id);

        console.log("User: ", user);
        if (!user) {
            return res.status(404).send("User not found.");
        }
    
        if (user.reputation < 50 || text.length > 140) {
            return res.status(400).json({ error: 'Comment should not exceed 140 characters or the poster have less than 50 reputation' });
        }
        
        let comment;
    
        console.log("Initialized comment");

        if (questionID !== undefined) {
            console.log("Inside qid!!");
            comment = new Comment({ userID: id, questionID, text, username: user.username });
            console.log(comment);
        } else if (answerID !== undefined) {
            console.log("Inside aid!!");
            comment = new Comment({ userID: id, questionID:null, answerID, text, username: user.username });
        } else {
            console.log("inside 400");
            return res.status(400).json({ error: 'Either questionID or answerID must be provided.' });
        }
        

        await comment.save();
        console.log("Comment saved");
        return res.status(200).json({ comment });
    } catch (e) {
        console.error(e);
        if (e instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token expired");
        }        
        res.status(500).send("Internal Server Error");
    }
});

router.post('/upvote', verifyToken, async(req, res) => {
    try {
        console.log(req.body);
        const comment = await Comment.findById(req.body.id);
        if (!comment) {
            res.status(404).json({message: "Answer not found"});
        }
        comment.votes++;
        await comment.save();
        res.json(comment);
    } catch (error) {
        console.log("Error: ", error);  
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token expired");
        }        
        res.status(500).json({message: "Server Error"});
    }    
});

module.exports = router;