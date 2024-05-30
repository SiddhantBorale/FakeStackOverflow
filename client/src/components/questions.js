import "../stylesheets/App.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Cookies from "js-cookie";

export default function Questions({
	model
}) {
	const [numQuestions, setNumQuestions] = useState(0);
	const [questions, setQuestions] = useState([]);
    const [unchangedQ, setUnchangedQ] = useState([]);
	const [tags, setTags] = useState([]);
	const [qloading, setQLoading] = useState(true);
	const [tagLoading, setTagLoading] = useState(true);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const [currentPage, setCurrentPage] = useState(0);

    const {searchText} = useParams();

	const QUESTIONS_PER_PAGE = 5;

    const QuestionLink = (props) => {
        const handleClick = async() => {
            const qid = props.qid;
            let resp = await model.incrementViews(qid);
            console.log("Link clicked", resp);
        }

        return (
            <div onClick={handleClick}>
                <Link to={props.to} className="question-title">{props.text}</Link>
            </div>
        );
    }

	const generateQuestions = (questions, givenTags) => {
		const startIndex = currentPage * QUESTIONS_PER_PAGE;
		const selectedQuestions = questions.slice(
			startIndex,
			startIndex + QUESTIONS_PER_PAGE
		);

		console.log("Given tags: ", givenTags);

		return selectedQuestions.map((question) => {
			console.log("Question tags: ", question.tags);
			const tagButtons = question.tags.map((tag) => (
				<button key={`${question._id}-${tag}`} className="button-tag">
					{givenTags !== undefined && givenTags.find((gTag) => {return gTag._id === tag;}).name}
				</button>
			));

			return (
				<div key={question._id} className="actual-question">
					<div className="question-sidebar">
						<p>{question.answers.length} answers</p>
						<p>{question.views} views</p>
						<p>{question.votes} votes</p>
					</div>
					<div className="question-content">
						<QuestionLink to={`/question/${question._id}`} qid={question._id} text={question.title} />
						<p>{question.summary}</p>
						<div className="info">
							{generateTimeString(
								question.ask_date_time,
								question.asked_by
							)}
						</div>
						<div className="tags">{tagButtons}</div>
                        <br/>
					</div>
				</div>
			);
		});
	};

    useEffect(() => {
		let token = Cookies.get('token');
		console.log(document.cookie);
		console.log(token);
        if (Cookies.get('token')) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [])

	const generateTimeString = (date, username) => {
		date = new Date(date);
		const currentDate = new Date();
		const timeDiff = currentDate.getTime();

		const seconds = Math.floor(timeDiff / 1000);
		const minutes = Math.floor(timeDiff / (1000 * 60));
		const hours = Math.floor(timeDiff / (1000 * 60 * 60));

		if (hours < 24) {
			if (hours < 1) {
				if (minutes < 1) {
					return `${username} asked ${seconds} seconds ago`;
				} else {
					return `${username} asked ${minutes} minutes ago`;
				}
			} else {
				return `${username} asked ${hours} hours ago`;
			}
		} else if (hours < 24 * 365) {
			const options = { month: "short", day: "numeric" };
			return `${username} asked ${date.toLocaleDateString(
				"en-US",
				options
			)} at ${date.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			})}`;
		} else {
			const options = { month: "short", day: "numeric", year: "numeric" };
			return `${username} asked ${date.toLocaleDateString(
				"en-US",
				options
			)} at ${date.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			})}`;
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			setQLoading(true);
			setTagLoading(true);

			setTags(await model.getTags());
			setTagLoading(false);

            console.log(searchText);

			await model.optimizeTags();

			if (searchText !== undefined) {
                console.log("Search text: ", searchText);
                let qs = await model.handleSearchQuery(searchText);
                setQuestions(qs);
                setUnchangedQ(qs);
                setNumQuestions(qs.length);
                setQLoading(false);
			} else {
                let questions = await model.getQuestions();
				let q = await model.sortQuestionsByDate(questions);
				setNumQuestions(q.length);
				setQuestions(q);
                setUnchangedQ(q);

				setQLoading(false);
				console.log("Loaded");
				console.log("q: ", q);                
			}
		};
		fetchData();
	}, [model, searchText]);

	const handleNext = () => {
		setCurrentPage(
			(prevPage) =>
				(prevPage + 1) %
				Math.ceil(questions.length / QUESTIONS_PER_PAGE)
		);
	};

	const handlePrev = () => {
		setCurrentPage(
			(prevPage) =>
				(prevPage -
					1 +
					Math.ceil(questions.length / QUESTIONS_PER_PAGE)) %
				Math.ceil(questions.length / QUESTIONS_PER_PAGE)
		);
	};

	const sortNewest = async () => {
		setQLoading(true);
		let q = await model.sortQuestionsByDate(unchangedQ);
		setNumQuestions(q.length);
		setQuestions(q);
		setQLoading(false);
	};

	const sortActive = async () => {
		setQLoading(true);
		let q = await model.sortQuestionsByAnswerActivity(unchangedQ);
		setNumQuestions(q.length);
		setQuestions(q);
		setQLoading(false);
	};

	const sortUnasnwered = async () => {
		setQLoading(true);
		let q = await model.getUnAsnweredQuestions(unchangedQ);
		setNumQuestions(q.length);
		setQuestions(q);
		setQLoading(false);
	};

	return (
		<div className="questions">
			<div className="question-header">
				<h1>All Questions</h1>
				{isLoggedIn && (
					<div className="ask-question">
						<Link to="/ask-question">
							<button
								id="ask-questions-button"
								className="ask-question-button"
							>
								Ask Question
							</button>
						</Link>
					</div>
				)}
			</div>
			<div className="no-of-questions">
				<h1 id="numQuestions">
					{qloading ? (
						"Loading..."
					) : numQuestions === 0 ? (
						<>No Questions</>
					) : (
						`${numQuestions} Questions`
					)}
				</h1>
				<div className="sorting-style">
					<button id="newest" className="newest" onClick={sortNewest}>
						Newest
					</button>
					<button id="active" className="active" onClick={sortActive}>
						Active
					</button>
					<button
						id="unanswered"
						className="unanswered"
						onClick={sortUnasnwered}
					>
						Unanswered
					</button>
				</div>
			</div>
			<div id="questions-content" className="questions-content">
				{!qloading && !tagLoading
					? generateQuestions(questions, tags)
					: "Loading..."}
			</div>
			<div id="controls" className="controls">
				<button onClick={handlePrev} disabled={currentPage === 0}>
					Prev
				</button>
				<button onClick={handleNext}>Next</button>
			</div>
		</div>
	);
}
