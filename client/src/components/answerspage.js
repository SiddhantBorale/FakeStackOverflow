import { useEffect, useState } from "react";
import {
	BiUpvote,
	BiDownvote,
	BiSolidUpvote,
	BiSolidDownvote,
} from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import "../stylesheets/App.css";
import Cookies from "js-cookie";
import Comments from "./showComments";

export default function AnswersPage({ model, askQuestion, isEdit }) {
	const [numAns, setNumAns] = useState(0);
	const [question, setQuestion] = useState({});
	const [answers, setAnswers] = useState([]);
	const [askedBytxt, setAskedByTxt] = useState("");
	const [qloading, setQLoading] = useState(false);
	const [aLoading, setALoading] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [votes, setVotes] = useState(0);

	const [isHoveredUp, setIsHoveredUp] = useState(false);
	const [isClickedUp, setIsClickedUp] = useState(false);
	const [isHoveredDown, setIsHoveredDown] = useState(false);
	const [isClickedDown, setIsClickedDown] = useState(false);

	const [isHoveredUpAns, setIsHoveredUpAns] = useState(false);
	const [isClickedUpAns, setIsClickedUpAns] = useState(false);
	const [isHoveredDownAns, setIsHoveredDownAns] = useState(false);
	const [isClickedDownAns, setIsClickedDownAns] = useState(false);

	const [ansVotes, setAnsVotes] = useState({});


	const [comments, setComments] = useState([]);

	const [curAnsPage, setCurAnsPage] = useState(0);

	const NUM_ANS = 5;

	const navigate = useNavigate();

	const { qid, userid } = useParams();

	useEffect(() => {
		setALoading(true);
		setQLoading(true);
		console.log("QID: ", qid);
		const fetchData = async () => {
			console.log("qidans: ", qid);
			let q = await model.getQuestionById(qid);
			let ans = await model.getAnswersByQID(qid);
			let cms = await model.getCommentsForQuestion(qid);
			setComments(cms);
			setQuestion(q);
			setVotes(q.votes);
			setNumAns(q.answers.length);
			setAnswers(ans);
			setAskedByTxt(generateTimeString(q.ask_date_time, q.asked_by));

			let curAnsVotes = {};

			for (let answer of ans) {
				curAnsVotes[answer._id] = answer.votes;
			}

			setAnsVotes(curAnsVotes);

			setQLoading(false);
			setALoading(false);

			let res = await model.optimizeTags();
		};
		fetchData();

		if (Cookies.get("token")) {
			setIsLoggedIn(true);
		} else {
			setIsLoggedIn(false);
		}
	}, [model, qid]);

	const generateTimeString = (date, username, isAns = false) => {
		date = new Date(date);
		const currentDate = new Date();
		const timeDiff = currentDate.getTime() - date;

		const seconds = Math.floor(timeDiff / 1000);
		const minutes = Math.floor(timeDiff / (1000 * 60));
		const hours = Math.floor(timeDiff / (1000 * 60 * 60));

		let askedAns = "asked";

		if (isAns) {
			askedAns = "answered";
		}

		if (hours < 24) {
			if (hours < 1) {
				if (minutes < 1) {
					return `${username} ${askedAns} ${seconds} seconds ago`;
				} else {
					return `${username} ${askedAns} ${minutes} minutes ago`;
				}
			} else {
				return `${username} ${askedAns} ${hours} hours ago`;
			}
		} else if (hours < 24 * 365) {
			const options = { month: "short", day: "numeric" };
			return `${username} ${askedAns} ${date.toLocaleDateString(
				"en-US",
				options
			)} at ${date.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			})}`;
		} else {
			const options = { month: "short", day: "numeric", year: "numeric" };
			return `${username} ${askedAns} ${date.toLocaleDateString(
				"en-US",
				options
			)} at ${date.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			})}`;
		}
	};

	const renderAnsText = (text) => {
		const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
		let lastIndex = 0;
		const parts = [];
		let match;

		while ((match = markdownLinkRegex.exec(text)) !== null) {
			const linkText = match[1];
			const linkUrl = match[2];
			const prefix = text.substring(lastIndex, match.index);

			if (prefix) {
				parts.push(prefix);
			}

			parts.push({ linkText, linkUrl });

			lastIndex = markdownLinkRegex.lastIndex;
		}

		const remainingText = text.substring(lastIndex);
		if (remainingText) {
			parts.push(remainingText);
		}

		return parts.map((part, index) => {
			if (typeof part === "object") {
				return (
					<a key={index} href={part.linkUrl}>
						{part.linkText}
					</a>
				);
			} else {
				return part;
			}
		});
	};

	const handleNext = (e, ans) => {
		e.preventDefault();
			setCurAnsPage(
				(prevPage) =>
					(prevPage + 1) % Math.ceil(ans.length / NUM_ANS)
			);
	};

	const handlePrev = (e, ans) => {
		e.preventDefault();

			setCurAnsPage(
				(prevPage) =>
					(prevPage - 1 + Math.ceil(ans.length / NUM_ANS)) %
					Math.ceil(ans.length / NUM_ANS)
			);
	};

	const onEditClick = (e, aid) => {
		e.preventDefault();
		navigate(`/post-answer-edit/${aid}`);
	}

	const AnsUpVoteButton = (props) => {
		const onClick = async (e) => {
			e.preventDefault();

			let token = Cookies.get("token");

			if (token) {
				console.log("Click!");
				setIsClickedUpAns(true);
				setIsClickedDownAns(false);
				const resp = await model.upvoteAnswer(props.aid, token);
				console.log(resp);
				if (resp.votes) {
					let curVotes = ansVotes;
					curVotes[props.aid] = resp.votes;
					setAnsVotes(curVotes);
				} else if (resp.message === "Token expired") {
					navigate("/login");
				} else {
					alert(resp.response.data);
					setIsClickedUpAns(false);
				}
			} else {
				navigate("/login");
			}
		};
		return (
			<button
				style={buttonStyle}
				onMouseEnter={() => setIsHoveredUpAns(true)}
				onMouseLeave={() => setIsHoveredUpAns(false)}
				onClick={(e) => onClick(e)}
			>
				<BiSolidUpvote size={32} />

			</button>
		);
	};

	const AnsDownVoteButton = (props) => {
		const onClick = async (e) => {
			e.preventDefault();
			let token = Cookies.get("token");

			if (token) {
				console.log("Click!");
				setIsClickedUpAns(false);
				setIsClickedDownAns(true);
				const resp = await model.downvoteAnswer(props.aid, token);
				if (resp.votes) {
					let curVotes = ansVotes;
					curVotes[props.aid] = resp.votes;
					setAnsVotes(curVotes);
				} else if (resp.message === "Token expired") {
					navigate("/login");
				} else {
					alert(resp.response.data);
					setIsClickedDownAns(false);
				}
			} else {
				navigate("/login");
			}
		};
		return (
			<button
				style={buttonStyle}
				onMouseEnter={() => setIsHoveredDownAns(true)}
				onMouseLeave={() => setIsHoveredDownAns(false)}
				onClick={(e) => onClick(e)}
			>
				<BiSolidDownvote size={32} />
			</button>
		);
	};	

	const generateAnswers = (curAns) => {
		const startIndex = curAnsPage * NUM_ANS;
		const selectedAns = curAns.slice(startIndex, startIndex + NUM_ANS);

		return selectedAns.map((answer) => {
			console.log(answer);
			let enableEdit = false;
			if (isEdit && userid) {
				enableEdit = userid === answer.userID;
			}
			return (
				<div key={answer._id} className="actual-question">
					<div className="question-content">
						{enableEdit ? <div>
							<button onClick={(e) => onEditClick(e, answer._id)} className="post-question-button">Edit</button>
						</div> : <div><AnsUpVoteButton aid={answer._id} />{ansVotes[answer._id]}<AnsDownVoteButton aid={answer._id} /></div>}
						<p className="ans-txt">{renderAnsText(answer.text)}</p>
						<div className="info">
							{generateTimeString(
								answer.ans_date,
								answer.ans_by,
								true
							)}
						</div>
						<br />
						<div>
							<Comments curComments={comments} model={model} aid={answer._id} />
						</div>
						{/* <div>{printComments(cms, answer._id)}</div> */}
					</div>
				</div>
			);
		});
	};

	const buttonStyle = {
		border: "none",
		background: "none",
		cursor: "pointer",
		padding: 0,
		outline: "none",
	};

	const UpVoteButton = (props) => {
		const onClick = async (e) => {
			e.preventDefault();

			let token = Cookies.get("token");

			if (token) {
				console.log("Click!");
				setIsClickedUp(true);
				setIsClickedDown(false);
				const resp = await model.upvoteQuestion(props.qid, token);
				console.log(resp);
				if (resp.votes) {
					setVotes(resp.votes);
				} else if (resp.message === "Token expired") {
					navigate("/login");
				} else {
					alert(resp.response.data);
					setIsClickedUp(false);
				}
			} else {
				navigate("/login");
			}
		};
		return (
			<button
				style={buttonStyle}
				onMouseEnter={() => setIsHoveredUp(true)}
				onMouseLeave={() => setIsHoveredUp(false)}
				onClick={(e) => onClick(e)}
			>
				{isClickedUp ? (
					<BiSolidUpvote size={32} />
				) : isHoveredUp ? (
					<BiSolidUpvote size={32} />
				) : (
					<BiUpvote size={32} />
				)}
			</button>
		);
	};

	const DownVoteButton = (props) => {
		const onClick = async (e) => {
			e.preventDefault();
			let token = Cookies.get("token");

			if (token) {
				console.log("Click!");
				setIsClickedUp(false);
				setIsClickedDown(true);
				const resp = await model.downvoteQuestion(props.qid, token);
				if (resp.votes) {
					setVotes(resp.votes);
				} else if (resp.message === "Token expired") {
					navigate("/login");
				} else {
					alert(resp.response.data);
					setIsClickedDown(false);
				}
			} else {
				navigate("/login");
			}
		};
		return (
			<button
				style={buttonStyle}
				onMouseEnter={() => setIsHoveredDown(true)}
				onMouseLeave={() => setIsHoveredDown(false)}
				onClick={(e) => onClick(e)}
			>
				{isClickedDown ? (
					<BiSolidDownvote size={32} />
				) : isHoveredDown ? (
					<BiSolidDownvote size={32} />
				) : (
					<BiDownvote size={32} />
				)}
			</button>
		);
	};

	return (
		<div className="questions">
			<div className="question-header">
				<UpVoteButton qid={question._id} />
				<p className="votes" id="numAns">
					{votes}
				</p>
				<DownVoteButton qid={question._id} />
				<h1 className="qname" id="qname">
					{question.title}
				</h1>
				{isLoggedIn && (
					<div className="ask-question">
						<button
							id="ask-questions-button"
							onClick={askQuestion}
							className="ask-question-button"
						>
							Ask Question
						</button>
					</div>
				)}
			</div>
			<div className="question-header">
				<p className="numViews" id="numViews">
					{!qloading ? question.views : "Loading..."}
				</p>
				<p id="desc" className="desc">
					{!qloading && question.text
						? renderAnsText(question.text)
						: "Loading..."}
				</p>
				<div className="username-asker">
					<p id="username-question">{askedBytxt}</p>
				</div>
				<br />
			</div>		
			<div>
				<Comments model={model} qid={qid} />
			</div>
			<p className="numAns" id="numAns">
				{numAns} Answers
			</p>
			<div id="ans-content">
				{!aLoading ? generateAnswers(answers) : "Loading..."}
			</div>
			<div id="controls" className="controls">
				<button onClick={e => handlePrev(e, answers)} disabled={curAnsPage === 0}>
					Prev
				</button>
				<button onClick={e => handleNext(e, answers)}>Next</button>
			</div>
			{isLoggedIn && (
				<button
					id="ans-question-button"
					className="ask-question-button"
					onClick={() => {
						navigate(`/post-answer/${qid}`);
					}}
				>
					Answer Question
				</button>
			)}
		</div>
	);
}
