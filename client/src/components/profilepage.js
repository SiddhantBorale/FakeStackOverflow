import Cookies from "js-cookie";
import "../stylesheets/App.css";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function UserProfile({ model }) {
	const [numQuestions, setNumQuestions] = useState(0);
	const [questions, setQuestions] = useState([]);
	const [rep, setRep] = useState(0);
	const [user, setUser] = useState({});

	const [userTags, setUserTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
	const [qloading, setQLoading] = useState(true);
	const [tagLoading, setTagLoading] = useState(true);
	const [answeredQuestions, setAnsweredQuestions] = useState([]);

	const [isAdmin, setIsAdmin] = useState(false);
	const [users, setUsers] = useState([]);

    const [usersLoading, setUsersLoading] = useState(true);
    const [userLoading, setUserLoading] = useState(true);
    const [toggle, setToggle] = useState(true);

	const navigate = useNavigate();

    const {uid} = useParams();

	useEffect(() => {
        console.log("UID: ", uid);
		const fetchData = async () => {
			setQLoading(true);
			setTagLoading(true);
            setUsersLoading(true);
            setUserLoading(true);

			await model.optimizeTags();

			let curUser = await model.getUserAuth();

            console.log("CurUser", curUser)

			setUser(curUser);
			setRep(curUser.reputation);

            setUserLoading(false);

			console.log("cur user: ", curUser);

			if (!uid && curUser.isAdmin) {
				setIsAdmin(true);
				let allUsers = await model.fetchUsers();
				setUsers(allUsers);
				console.log("admin");
                setUsersLoading(false);
			} else {
				setIsAdmin(false);
                let data;
                if (curUser.isAdmin && uid) {
                    curUser = await model.getUserAuth(uid);
                    setUser(curUser);
                    setRep(curUser.reputation);
                    data = await model.getUserData(uid);
                } else if (!curUser.isAdmin && uid) {
                    navigate("/questions");
                } else {
				    data = await model.getUserData();
                }
				data = data.retData;
				console.log("Data: ", data);

				if (!data) {
					navigate("/login");
				}

				setUserTags(data.tags);
                setAllTags(data.allTags);
				setTagLoading(false);

				let questions = data.questions;
				let q = await model.sortQuestionsByDate(questions);
				setNumQuestions(q.length);
				setQuestions(q);

				setQLoading(false);

				setAnsweredQuestions(data.answeredQuestions);
				console.log("Loaded");
				console.log("q: ", data.answeredQuestions);
			}
		};

		if (!Cookies.get("token")) {
			navigate("/login");
		} else {
			fetchData();
		}
	}, [model, navigate, uid, toggle]);

	const generateQuestions = (questions, givenTags, asked = true) => {
		console.log("qs: ", questions);
        if (!asked) {
            questions = Array.from(new Set(questions.map(question => question._id))).map(id => questions.find(question => question._id === id));
        }
		return questions.map((question) => {
			const {
				_id,
				tags,
				asked_by,
				ask_date_time,
				answers,
				views,
			} = question;

			const tagButtons = tags.map((tag) => {
                console.log(givenTags, tag)
				return (
					<button
						key={`${_id}-${tag}`}
						className="button-tag"
					>
						{givenTags.find((giveTag) => giveTag._id === tag).name}
					</button>
				);
			});

			const numAnswers = answers.length;

			return (
				<div key={_id} id={_id} className="actual-question">
					<div className="question-sidebar">
						<p id={`${_id}-numAnswers`}>{numAnswers} answers</p>
						<p id={`${_id}-numViews`}>{views} views</p>
					</div>
					<div className="question-content">
						{!asked ? (
							<Link
								to={`/question-edit/${question._id}/${user._id}`}
								className="question-title"
							>
								{question.title}
							</Link>
						) : (
							<Link
								to={`/ask-question/${question._id}`}
								className="question-title"
							>
								{question.title}
							</Link>
						)}
                        <p>{question.summary}</p>
						<div id={`${_id}-info`} className="info">
							{generateTimeString(ask_date_time, asked_by)}
						</div>
						<div className="tags">{tagButtons}</div>
					</div>
				</div>
			);
		});
	};

    const deleteUser = async(e, uid) => {
        e.preventDefault();
        const resp = await model.deleteUser(uid);
        console.log(resp);
        setToggle(!toggle);
    }

	const genUsers = (users) => {
		return users.map((user) => {
			const { _id, username } = user;

			return (
				<div key={_id} id={_id} className="actual-question">                    
					<div className="question-content">
                        <Link
                            to={`/profile/${user._id}`}
                            className="question-title"
                        >
                            {username}
                        </Link>
						<div id={`${_id}-info`} className="info-content">
							{/* {generateTimeString(ask_date_time, asked_by)} */}
                            <button className="ask-question-button" onClick={(e) => deleteUser(e, _id)}>Delete</button>
						</div>
					</div>
				</div>
			);
		});
	};

	const generateTimeString = (date, username, isCreate = false) => {
		console.log("Date: ", date);
		date = new Date(date);
		const currentDate = new Date();
		const timeDiff = currentDate.getTime();

		const seconds = Math.floor(timeDiff / 1000);
		const minutes = Math.floor(timeDiff / (1000 * 60));
		const hours = Math.floor(timeDiff / (1000 * 60 * 60));

		if (hours < 24) {
			if (hours < 1) {
				if (minutes < 1) {
					if (!isCreate) {
						return `${username} asked ${seconds} seconds ago`;
					} else {
						return `${username} asked ${seconds} seconds ago`;
					}
				} else {
					if (!isCreate) {
						return `${username} asked ${minutes} minutes ago`;
					} else {
						return `${username} joined ${minutes} hours ago`;
					}
				}
			} else {
				if (!isCreate) {
					return `${username} asked ${hours} hours ago`;
				} else {
					return `${username} joined ${hours} hours ago`;
				}
			}
		} else if (hours < 24 * 365) {
			const options = { month: "short", day: "numeric" };
			if (!isCreate) {
				return `${username} asked ${date.toLocaleDateString(
					"en-US",
					options
				)} at ${date.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
				})}`;
			} else {
				return `${username} joined FakeStackOverflow at ${date.toLocaleDateString(
					"en-US",
					options
				)} ${date.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
				})}`;
			}
		} else {
			const options = { month: "short", day: "numeric", year: "numeric" };
			if (!isCreate) {
				return `${username} asked ${date.toLocaleDateString(
					"en-US",
					options
				)} at ${date.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
				})}`;
			} else {
				return `${username} joined FakeStackOverflow at ${date.toLocaleDateString(
					"en-US",
					options
				)} ${date.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
				})}`;
			}
		}
	};

	const displayTags = (tags, questions) => {
		return tags.map((tag) => {
			return (
				<div key={tag._id} className="tags-box">
					<Link to={`/edittags/${tag._id}`} className="tags-box-link">
						{tag.name}
					</Link>
					<p>
						{model.getNumQuestionsWithTag(tag._id, questions)}{" "}
						Questions
					</p>
				</div>
			);
		});
	};

	return (
		<div className="questions">
			<div className="question-header">
				<h1>{!userLoading ? user.username : "Loading..."}</h1>
				<h1 id="" className="">
					{rep} Reputation
				</h1>
			</div>
			<div>{!userLoading ? generateTimeString(user.date, user.username, true) : ""}</div>
			<hr />
			{!isAdmin ? (
				<div>
					<div className="questions-container-profile">
						<h3 id="numQuestions">
							{qloading ? (
								"Loading..."
							) : numQuestions === 0 ? (
								<>No Questions</>
							) : (
								`${numQuestions} Questions`
							)}
						</h3>
						<div
							id="questions-content"
							className="questions-content"
						>
							{!qloading && !tagLoading
								? generateQuestions(questions, allTags)
								: "Loading..."}
						</div>
					</div>
					<hr />
					<div className="questions-container-profile">
						<h3>Tags</h3>
						<div id="tags-tpage" className="tags-tpage">
							{!tagLoading
								? displayTags(userTags, questions)
								: "Loading..."}
						</div>
					</div>
					<hr />
					<div className="questions-container-profile">
						<h3 id="numQuestions">
							{qloading ? (
								"Loading..."
							) : answeredQuestions.length === 0 ? (
								<>No Questions</>
							) : (
								`${answeredQuestions.length} Questions`
							)}
						</h3>
						<div
							id="questions-content"
							className="questions-content"
						>
							{!qloading && !tagLoading
								? generateQuestions(
										answeredQuestions,
										allTags,
										false
								  )
								: "Loading..."}
						</div>
					</div>
					<hr />
				</div>
			) : (
				<div>
                    <div>
                        <h3 id="numQuestions">
                            {usersLoading ? (
                                "Loading..."
                            ) : users.length === 0 ? (
                                <>No Users</>
                            ) : (
                                `${users.length} Users`
                            )}
                        </h3>
                    </div>
					<div id="questions-content" className="questions-content">
						{!usersLoading
							? genUsers(users)
							: "Loading..."}
					</div>
				</div>
			)}
		</div>
	);
}
