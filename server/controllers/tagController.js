const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const jwtSecretKey = process.env.JWT_KEY || 'default-key';
const router = express.Router();
let Tag = require('../models/tags');
const Question = require('../models/questions');
const { default: mongoose } = require('mongoose');

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

router.get('/:id', async(req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            res.status(404).json({message: "Tag not found"});
        }
        res.json(tag);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({message: "Server Error"});
    }
});

router.get('/', async(req, res) => {
    try {
        const tags = await Tag.find();
        res.json(tags);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
});

router.post('/addtags', async(req, res) => {
    try {
        const { tags } = req.body;

        for (let tag of tags) {
            const curTag = await Tag.findOne({ name: tag.name });
            if (!curTag) {
                let newTag = new Tag({name: tag.name});
                await newTag.save();
            }
        }
    
        res.status(201).json({ message: 'Tags created successfully', question: newQuestion });        
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
});

router.get('/name/:name', async(req, res) => {
    try {
        const tag = await Tag.findOne({name: req.params.name});
        if (!tag) {
            res.status(404).json({message: "Tag not found"});
        }
        res.json(tag);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({message: "Server Error"});
    }
});

router.get('/otheruser/:id', async(req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            res.status(404).json({message: "Tag not found"});
        }
        let numUsers = 0;
        let questions = await Question.find({});
        for (let question of questions) {
            if (question.tags.includes(tag._id)) {
                numUsers++;
                if (numUsers > 1) {
                    break;
                }
            }
        }
        let isDup = numUsers > 1;
        res.json({isDup});
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({message: "Server Error"});
    }
})


router.post('/edittag', verifyToken, async(req, res) => {
    const {tid, text} = req.body;
    const tag = await Tag.findById(tid);

    if (!tag) {
        return res.status(404).send("Tag not found");
    }

    tag.name = text;
    await tag.save();

    res.status(201).json({tag});
})

router.post('/delete', verifyToken, async(req, res) => {
    const {tid} = req.body;
    let questions = await Question.find({});

    for (let question of questions) {
        qstags = question.tags.map(qt => qt.toString());
        if (qstags.includes(tid)) {
            question.tags = question.tags.filter(item => item.toString() !== tid);
            console.log("Question tag found: ", question.tags);
            await question.save();
        }
    }

    await Tag.findByIdAndDelete(tid);

    res.status(200).send("OK.");
})

router.post('/optimizetags', async(req, res) => {
    const tags = await Tag.find({});
    const questions = await Question.find({});

    let usedTags = new Set();

    for (let question of questions) {
        for (let tagID of question.tags) {
            usedTags.add(tagID.toString());
        }
    }

    for (let tag of tags) {
        let tagId = tag._id.toString();
        if (!usedTags.has(tagId)) {
            await Tag.findByIdAndDelete(tagId);
            console.log("Deleted Tag");
        }
    }

    res.status(200).send("OK");
})
module.exports = router;