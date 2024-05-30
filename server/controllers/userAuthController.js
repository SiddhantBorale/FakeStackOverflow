const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const express = require('express');

const dotenv = require('dotenv');

let User = require('../models/user');
let Comment = require('../models/comments');
const Question = require('../models/questions');
const Tag = require('../models/tags');
const Answer = require('../models/answers');

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


router.post('/register', async(req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const registeredUser = await User.findOne({ email: req.body.email });

        if (registeredUser) {
            res.status(409).send("User already exists");
        }

        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });
        await user.save();
        res.status(201).send("User registered successfully.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error registering user");
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send("User not found.");
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).send("Invalid password.");
        }
        const token = jwt.sign({ id: user._id, email: user.email }, jwtSecretKey, { expiresIn: '1h' });
        res.cookie('token', token, {maxAge:3600000, sameSite: "lax"});
        res.status(200).send({"Message": "Login successful"});
    } catch (error) {
        console.error(error);
        res.status(401).send("Error logging in.");
    }
});

router.get('/details/:uid', verifyToken, async(req, res) => {
    const {uid} = req.params;
    const {id, email} = req.user;

    console.log("UID: ", uid);

    let user;
    if (uid === null || uid === undefined || uid === "null") {
        user = await User.findById(id);
    } else {
        user = await User.findById(uid);
    }

    return res.status(201).json(user);
});

router.get('/users', verifyToken, async(req, res) => {
    const {id, email} = req.user;
    const user = await User.findById(id);
    if (user.isAdmin) {
        let users = await User.find({});
        users = users.filter(user => user.isAdmin === false);
        return res.status(201).json(users);
    }
    return res.status(201).json(user);
});


router.get('/data/:uid', verifyToken, async(req, res) => {
    const {id, email} = req.user;
    const {uid} = req.params;

    let questions;
    let answers;

    if (uid !== null && uid !== undefined && uid !== "null") {
        questions = await Question.find({userID: uid});
        answers = await Answer.find({userID: uid});
    } else {
        questions = await Question.find({userID: id});
        answers = await Answer.find({userID: id});
    }
    let tags = new Set();

    for (let question of questions) {
        for (let tagID of question.tags) {
            let tag = await Tag.findById(tagID);
            if (tag) {
                tags.add(tag);
            }
        }
    }

    tags = [...tags];

    let allTags = await Tag.find({});
    
    console.log("AllTags: ", allTags);

    let answeredQuestions = new Set();

    for (let answer of answers) {
        let q = await Question.findById(answer.qID);
        if (q)
            answeredQuestions.add(q);
    }

    answeredQuestions = [...answeredQuestions];

    let retData = {
        "questions": questions,
        "tags": tags,
        "answeredQuestions": answeredQuestions,
        "allTags": allTags
    }
    
    res.status(201).json({retData});
});

router.post("/delete", verifyToken, async(req, res) => {
    const {id,email} = req.user;
    let user = await User.findById(id);

    if (user.isAdmin) {
        const {uid} = req.body;
        let questions = await Question.find({userID:uid});

        for (let question of questions) {
            let qid = question._id;
            let comments = await Comment.find({questionId:qid});

            for (let comment of comments) {
                await Comment.deleteOne({_id: comment._id});
                console.log("comment deleted");
            }
    
            let answers = await Answer.find({qID: qid});
    
            for (let answer of answers) {
                let comments = await Comment.find({answerID:answer._id});
    
                for (let comment of comments) {
                    await Comment.deleteOne({_id: comment._id});
                    console.log("comment deleted");
                }
        
                await Answer.findByIdAndDelete(answer._id);
        
                console.log("answer deleted");            
            }
    
            await Question.findByIdAndDelete(qid);
    
            console.log("Question deleted");            
        }

        await User.findByIdAndDelete(uid);
        console.log("User deleted.");

        res.status(200).send("ok");
    } else {
        res.status(401).send("Cannot delete")
    }
})

module.exports = router;