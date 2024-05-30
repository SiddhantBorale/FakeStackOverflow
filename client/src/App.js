// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./stylesheets/App.css";
import Questions from "./components/questions.js";
import { useEffect, useMemo } from "react";
import TagsPage from "./components/tagspage.js";
import AskQuestion from "./components/askpage.js";
import AnswersPage from "./components/answerspage.js";
import PostAnswer from "./components/postanswer.js";
import API from "./API/api.js";
import LoginPage from "./components/loginpage";
import WelcomePage from "./components/welcomepage";
import RegisterPage from "./components/registerpage";
import Navigation from "./components/Navigation";
import UserProfile from "./components/profilepage";
import EditTag from "./components/editTag.js";

function App() {
	const api = useMemo(() => new API(), []);

	useEffect(() => {
		const asyncOpr = async() => {
			let res = await api.optimizeTags();
			console.log(res);
		}
		asyncOpr();
	}, [api])

	return (
		<Router>
			<div className="fakeso">
				<Routes>
					<Route path="/" element={<WelcomePage />} />
					<Route path="/login" element={<LoginPage api={api}/>} />
					<Route path="/register" element={<RegisterPage api={api}/>} />
					<Route
						path="/questions"
						element={
							<Navigation>
								<Questions model={api} />
							</Navigation>
						}
					/>
					<Route
						path="/questions/search/:searchText"
						element={
							<Navigation>
								<Questions model={api} />
							</Navigation>
						}
					/>
					<Route
						path="/tags"
						element={
							<Navigation>
								<TagsPage model={api} />
							</Navigation>
						}
					/>
					<Route
						path="/ask-question"
						element={
							<Navigation>
								<AskQuestion model={api} />
							</Navigation>
						}
					/>
					<Route
						path="/ask-question/:qid"
						element={
							<Navigation>
								<AskQuestion model={api} />
							</Navigation>
						}
					/>
					<Route
						path="/profile"
						element={
							<Navigation>
								<UserProfile model={api} />
							</Navigation>
						}
					/>
					<Route
						path="/profile/:uid"
						element={
							<Navigation>
								<UserProfile model={api} />
							</Navigation>
						}
					/>					
					<Route
						path="/question/:qid"
						element={
							<Navigation>
								<AnswersPage model={api} />
							</Navigation>
						}
					/>
					<Route
						path="/question-edit/:qid/:userid"
						element={
							<Navigation>
								<AnswersPage model={api} isEdit={true}/>
							</Navigation>
						}
					/>
					<Route
						path="/post-answer-edit/:aid"
						element={
							<Navigation>
								<PostAnswer model={api} />
							</Navigation>
						}
					/>					
					<Route
						path="/post-answer/:qid"
						element={
							<Navigation>
								<PostAnswer model={api} />
							</Navigation>
						}
					/>
					<Route
						path="/edittags/:tid"
						element={
							<Navigation>
								<EditTag model={api} />
							</Navigation>
						}
					/>					
				</Routes>
			</div>
		</Router>
	);
}

export default App;
