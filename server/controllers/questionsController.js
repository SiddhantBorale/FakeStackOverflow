const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const jwtSecretKey = process.env.JWT_KEY || 'default-key';

const router = express.Router();
let Question = require('../models/questions');
let Tag = require('../models/tags');
let User = require('../models/user');
let Comment = require("../models/comments");
const Answer = require('../models/answers');


router.get('/:id', async(req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            res.status(404).json({message: "Question not found"});
        }
        res.json(question);
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


router.post('/upvote', verifyToken, async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { id: questionId } = req.body;

        console.log(userId, questionId);

        if (!userId || !questionId) {
            return res.status(400).json({ message: 'User ID and Question ID are required.' });
        }

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            res.status(404).json({message: "Question not found"});
        }

        if (user.reputation < 50) {
            return res.status(401).send("Cannot vote when rep is less than 50");
        } else {
            question.votes++;
            await question.save();
        }

        let qsUser = await User.findById(question.userID);
        qsUser.reputation += 5;  
        await qsUser.save();  

        res.json(question);
    } catch (error) {
        console.log("Error: ", error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token expired");
        }
        res.status(500).json({ message: "Server Error" });
    }
});

router.post('/downvote', verifyToken, async(req, res) => {
    try {
        const {id, email} = req.user;

        let user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const question = await Question.findById(req.body.id);

        if (!question) {
            res.status(404).json({message: "Question not found"});
        }        

        if (user.reputation < 50) {
            return res.status(401).send("Cannot vote when rep is less than 50");
        } else {
            question.votes--;
            await question.save();
        }

        let qsUser = await User.findById(question.userID);
        qsUser.reputation -= 10;  
        await qsUser.save();        

        res.json(question);
    } catch (error) {
        console.log("Error: ", error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token expired");
        }        
        res.status(500).json({message: "Server Error"});
    }    
});

router.get('/', async(req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
});

const processTag = async (tag) => {
    try {
        tag = tag.toLowerCase();
        const tagDoc = await Tag.findOne({ name: tag });
        if (tagDoc) {
            console.log("Exists");
            return tagDoc._id;
        } else {
            console.log("DNE");
            let newT = new Tag({ name: tag });
            await newT.save();
            return newT._id;
        }
    } catch (error) {
        console.error("Error occurred:", error);
        throw error; // Propagate the error
    }
};

const processAllTags = (tags) => {
    return Promise.all(tags.map(tag => processTag(tag)));
};

router.post('/addquestion', verifyToken, async (req, res) => {
    try {
        const { title, text, tags, summary } = req.body;
        const {id, email} = req.user;

        let userID = id;
        const user = await User.findOne({ email: email });
        let asked_by = user.username;

        let filteredTags = removeDuplicates(tags);

        const processedTags = await processAllTags(filteredTags);

        console.log("Ids: ", processedTags);
        const newQuestion = new Question({
            title,
            text,
            tags: processedTags,
            asked_by,
            userID,
            summary
        });
        await newQuestion.save();

        console.log("New question: ", newQuestion);

        // const updatedNQ = await Question.findByIdAndUpdate(newQuestion._id, {tags: ids}, {new: true});

        res.status(201).json({ message: 'Question created successfully' });
    } catch (error) {
        console.error(error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token expired");
        }
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/updatequestion', verifyToken, async (req, res) => {
    try {
        const { title, text, tags, qid, summary } = req.body;
        const {id, email} = req.user;

        let userID = id;
        const user = await User.findOne({ email: email });
        let asked_by = user.username;

        let filteredTags = removeDuplicates(tags);

        const processedTags = await processAllTags(filteredTags);

        console.log("Ids: ", processedTags);
        const question = await Question.findById(qid);

        question.title = title;
        question.text = text;
        question.tags = processedTags;
        question.asked_by = asked_by;
        question.summary = summary;

        await question.save();

        console.log("Updated question: ", question);

        // const updatedNQ = await Question.findByIdAndUpdate(newQuestion._id, {tags: ids}, {new: true});

        res.status(201).json({ message: 'Question updated successfully' });
    } catch (error) {
        console.error(error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token expired");
        }
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/delete', verifyToken, async(req, res) => {
    try {
        const {qid} = req.body;

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

        res.send("OK");
    } catch (error) {
        console.log("Error: ", error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token expired");
        }        
        res.status(500).json({message: "Server Error"});
    }
});

router.post('/incrementviews/:id', async(req, res) => {
    try {
        const questionId = req.params.id;
        const updatedQuestion = await Question.findByIdAndUpdate(
          questionId,
          { $inc: { views: 1 } },
          { new: true }
        );
        res.json(updatedQuestion);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({message: "Server Error"});
    }
});

const termInQuestionTag = (term, tags, question) => {
    let qtags = question.tags;
    let curTag = null;

    for (let curT of tags) {
        if (curT.name === term) {
            curTag = curT;
            break;
        }
    }

    console.log(curTag);

    if (curTag === null) {
        return false;
    }

    for (let tag of qtags) {
        console.log(tag);
        if (tag.equals(curTag._id)) {
            console.log("found!");
            return true;
        }
    }

    return false;
}

const removeDuplicates = (array) => {
    return array.filter((element, index) => {
        // Returns true if the index of the current element is the first occurrence in the array
        return array.indexOf(element) === index;
    });
}

router.post('/search', async(req, resp) => {
    const {searchTerms} = req.body;
    let questions = await Question.find({});
    let tags = await Tag.find({});

    let filteredSearchTerms = removeDuplicates(searchTerms);

    let res = []

    for (let question of questions) {
        for (let term of filteredSearchTerms) {
            if (term.startsWith('[') && term.endsWith(']')) {
                let curTerm = term.slice(1,-1);
                console.log(curTerm);
                if (termInQuestionTag(curTerm, tags, question)) {
                    res.push(question);
                    break;
                }
              } else {
                if (question.title.toLowerCase().includes(term) || question.text.toLowerCase().includes(term)) {
                    res.push(question);
                    break;
                } else {
                    let found = false;
                    for (let ansID of question.answers) {
                        let ansModel = await Answer.findById(ansID);
                        console.log(ansModel);
                        if (ansModel.text.toLowerCase().includes(term)) {
                            res.push(question);
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        break;
                    }
                }
            }
        }
    }

    console.log("Final res: ", res);

    resp.json(res);

    
})

module.exports = router;