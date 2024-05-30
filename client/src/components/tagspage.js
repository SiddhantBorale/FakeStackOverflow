import { useEffect, useState } from "react";
import "../stylesheets/App.css";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

export default function TagsPage({
	model
}) {
	const [numTags, setNumTags] = useState(0);
	const [tags, setTags] = useState([]);
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [qloading, setQloading] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		setLoading(true);
		const loadData = async () => {
			let tags = await model.getTags();
			let qs = await model.getQuestions();
			await model.optimizeTags();
			console.log("Tags: ", tags);
			setNumTags(tags.length);
			setTags(tags);
			setQuestions(qs);
			setLoading(false);
			setQloading(false);
		};
		loadData();

		if (Cookies.get("token")) {
			setIsLoggedIn(true);
		} else {
			setIsLoggedIn(false);
		}
	}, [model]);

	const displayTags = (tags, questions) => {
		return tags.map((tag) => {
			return (
				<div key={tag._id} className="tags-box">
					<Link to={`/questions/search/[${encodeURIComponent(tag.name)}]`} className="tags-box-link">
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
				<h1 id="numTags">
					{numTags === 0 ? `No Tags` : `${numTags} Tags`}
				</h1>
				<h1>All Tags</h1>
				{isLoggedIn && (
					<Link to="/ask-question">
						<button
							id="ask-questions-button"
							className="ask-question-button"
						>
							Ask Question
						</button>
					</Link>
				)}
			</div>
			<div id="tags-tpage" className="tags-tpage">
				{!loading && !qloading
					? displayTags(tags, questions)
					: "Loading..."}
			</div>
		</div>
	);
}
