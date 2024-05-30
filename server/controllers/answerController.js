const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const jwtSecretKey = process.env.JWT_KEY || 'default-key';

const router = express.Router();
let Question = require('../models/questions');
let Answer = require('../models/answers');
let User = require('../models/user');
const Comment = require('../models/comments');


router.get('/questionid/:id', async(req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            res.status(404).json({message: "Question not found"});
        }
        const ansIds = question.answers;
        let answers = []

        for (let ans of ansIds) {
            let answer = await Answer.findById(ans);
            answers.push(answer);
        }
        res.json(answers);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({message: "Server Error"});
    }
});

router.get('/:id', async(req, res) => {
    try {
        const answer = await Answer.findById(req.params.id);
        res.json(answer);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({message: "Server Error"});
    }
});

router.get('/', async(req, res) => {
    try {
        const answers = await Answer.find({});
        res.json(answers);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({message: "Server Error"});
    }    
});

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

router.post('/addanswer', verifyToken, async(req, res) => {
    try {
        const {text, qid} = req.body;
        const {id, email} = req.user;
        const user = await User.findOne({ email: email });

        let ans_by = user.username;
        let userID = id
        let newAns = new Answer({text, ans_by, userID, qID:qid});

        console.log("Qid: ", qid);

        await newAns.save();
        await Question.findByIdAndUpdate(qid, {$push: {answers: newAns._id}}, {new: false});

        console.log("ans saved and updated");

        res.json(newAns);
    } catch (error) {
        console.log("Error: ", error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token expired");
        }        
        res.status(500).json({message: "Server Error"});
    }
});

router.post('/edit', verifyToken, async(req, res) => {
    try {
        const {text, aid} = req.body;
        const {id, email} = req.user;
        const user = await User.findOne({ email: email });

        let oldAns = await Answer.findById(aid);

        oldAns.text = text;

        await oldAns.save();

        console.log("ans saved and updated");

        res.json(oldAns);
    } catch (error) {
        console.log("Error: ", error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token expired");
        }        
        res.status(500).json({message: "Server Error"});
    }
});

router.post('/delete', verifyToken, async(req, res) => {
    try {
        const {aid} = req.body;

        let comments = await Comment.find({answerID:aid});

        for (let comment of comments) {
            await Comment.deleteOne({_id: comment._id});
            console.log("comment deleted");
        }

        let answer = await Answer.findById(aid);
        let question = await Question.findById(answer.qID);

        console.log(question.answers.includes(answer._id));
        console.log("aid: ", answer._id);

        if (question.answers.includes(answer._id)) {
            question.answers = question.answers.filter(ans => ans.toString() !== answer._id.toString());
            console.log(question.answers);
            await question.save();
        }

        await Answer.findByIdAndDelete(aid);

        console.log("answer deleted");

        res.send("OK");
    } catch (error) {
        console.log("Error: ", error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token expired");
        }        
        res.status(500).json({message: "Server Error"});
    }
});

router.post('/upvote', verifyToken, async(req, res) => {
    try {
        const answer = await Answer.findById(req.body.id);
        if (!answer) {
            res.status(404).json({message: "Answer not found"});
        }
        const {id, email} = req.user;
        let user = await User.findById(id);
        if (user.reputation < 50) {
            return res.status(401).send("Cannot vote when rep is less than 50");
        } else {
            answer.votes++;
            await answer.save();
        }

        let ansUser = await User.findById(answer.userID);
        ansUser.reputation += 5;  
        await ansUser.save();
        res.json(answer);
    } catch (error) {
        console.log("Error: ", error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token expired");
        }        
        res.status(500).json({message: "Server Error"});
    }    
});

router.post('/downvote', verifyToken, async(req, res) => {
    try {
        const answer = await Answer.findById(req.body.id);
        if (!answer) {
            res.status(404).json({message: "Answer not found"});
        }
        const {id, email} = req.user;
        let user = await User.findById(id);
        if (user.reputation < 50) {
            return res.status(401).send("Cannot vote when rep is less than 50");
        } else {
            answer.votes--;
            await answer.save();
        }

        let ansUser = await User.findById(answer.userID);
        ansUser.reputation -= 10; 
        await ansUser.save(); 
        res.json(answer);
    } catch (error) {
        console.log("Error: ", error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token expired");
        }        
        res.status(500).json({message: "Server Error"});
    }    
});

module.exports = router;