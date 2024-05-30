// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
let userArgs = process.argv.slice(2);

console.log(userArgs);

if (!userArgs[0].startsWith("mongodb")) {
	console.log(
		"ERROR: You need to specify a valid mongodb URL as the first argument"
	);
	return;
}

const adminUsername = userArgs[1];
const adminPassword = userArgs[2];

// Validate admin credentials
if (!adminUsername || !adminPassword) {
	console.log(
		"ERROR: Admin username and password must be provided as arguments."
	);
	return;
}

let Tag = require("./models/tags");
let Answer = require("./models/answers");
let Question = require("./models/questions");
let User = require("./models/user");
let Comment = require("./models/comments");

const bcrypt = require("bcrypt");

let mongoose = require("mongoose");
let mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const sampleUsers = [
	{
		username: "user1",
		password: "password1",
		email: "user1@example.com",
		reputation: 100,
		isAdmin: false,
	},
	{
		username: "user2",
		password: "password2",
		email: "user2@example.com",
		reputation: 50,
		isAdmin: false,
	},
	{
		username: adminUsername,
		password: adminPassword,
		email: adminUsername,
		reputation: 1000,
		isAdmin: true,
	},
];

const sampleTags = [
	{ name: "react" },
	{ name: "javascript" },
	{ name: "android-studio" },
	{ name: "shared-preferences" },
];

const sampleAnswers = [
	{ text: "Answer 1 text", ans_by: "user1", votes: 5 },
	{ text: "Answer 2 text", ans_by: "user2", votes: 3 },
	{ text: "Answer 3 text", ans_by: "user2", votes: 3 },
	{ text: "Answer 4 text", ans_by: "user1", votes: 2 },
];

const sampleQuestions = [
	{
		title: "Programmatically navigate using React router",
		summary: "react question",
		text: `the alert shows the proper index for the li clicked, and when I alert the variable within the last function I'm calling, moveToNextImage(stepClicked), the same value shows but the animation isn't happening. This works many other ways, but I'm trying to pass the index value of the list item clicked to use for the math to calculate.`,
		tags: [],
		asked_by: "Joji John",
		views: 10,
		votes: 2,
		answers: [],
	},
	{
		title: "Android studio save string shared preference, start activity and load the saved string",
		summary: "android question",
		text: `I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.`,
		tags: [],
		asked_by: "user2",
		views: 8,
		votes: 4,
		answers: [],
	},
];

const sampleComments = [
	{
		userID: "",
		text: "Comment 1 text",
		votes: 2,
	},
	{
		userID: "",
		text: "Comment 2 text",
		votes: 1,
	},
	{
		userID: "",
		text: "Comment 3 text",
		votes: 1,
	},
	{
		userID: "",
		text: "Comment 4 text",
		votes: 1,
	},		
];

const hashPasswords = async () => {
	try {
		for (const user of sampleUsers) {
			const hashedPassword = await bcrypt.hash(user.password, 10);
			user.password = hashedPassword;
		}
	} catch (error) {
		console.error("Error hashing passwords:", error);
	}
};

const initializeSampleData = async () => {
	try {
		await hashPasswords();

		const createdUsers = await User.insertMany(sampleUsers);

		const createdTags = await Tag.insertMany(sampleTags);		

		sampleQuestions[0].tags = [createdTags[0]._id, createdTags[1]._id];
		sampleQuestions[1].tags = [createdTags[2]._id, createdTags[3]._id];

		sampleQuestions[0].userID = createdUsers[0]._id;
		sampleQuestions[1].userID = createdUsers[1]._id;

		const createdQuestions = await Question.insertMany(sampleQuestions);

		sampleAnswers[0].qID = createdQuestions[0]._id;
		sampleAnswers[1].qID = createdQuestions[1]._id;
		sampleAnswers[2].qID = createdQuestions[0]._id;
		sampleAnswers[3].qID = createdQuestions[1]._id;			

		sampleAnswers[0].userID = createdUsers[2]._id;
		sampleAnswers[1].userID = createdUsers[1]._id;
		sampleAnswers[2].userID = createdUsers[0]._id;
		sampleAnswers[3].userID = createdUsers[1]._id;		

		const createdAnswers = await Answer.insertMany(sampleAnswers);

		createdQuestions[0].answers.push(createdAnswers[0]._id);
		createdQuestions[0].answers.push(createdAnswers[2]._id);

		createdQuestions[1].answers.push(createdAnswers[1]._id);
		createdQuestions[1].answers.push(createdAnswers[3]._id);

		for (let createdQ of createdQuestions) {
			await createdQ.save();
		}

		let i = 0;

		for (let comment of sampleComments) {
			comment.userID = createdUsers[i % createdUsers.length]._id;
			comment.username = createdUsers[i % createdUsers.length].username;
			if (i % 2 == 0) {
				comment.questionID = createdQuestions[i % createdQuestions.length]._id;
			} else {
				comment.answerID = createdAnswers[i % createdAnswers.length]._id;
			}
			i++;
		}
		const createdComments = await Comment.insertMany(sampleComments);

		// await createdTags.save();
		// await createdQuestions.save();
		// await createdAnswers.save();
		// await createdComments.save();
		// await createdUsers.save();

		console.log("Sample data initialized successfully!");
	} catch (error) {
		console.error("Error initializing sample data:", error);
		mongoose.disconnect();
	} finally {
		mongoose.disconnect();
	}
};

initializeSampleData();
