import axios from "axios";
import Cookies from "js-cookie";

export default class API {
	getQuestions = async () => {
		let questions = await axios.get(
			"http://localhost:8000/posts/question/"
		);
		console.log("Questions: ", questions);
		return questions.data;
	};

	getTags = async () => {
		let tags = await axios.get("http://localhost:8000/posts/tag/");
		console.log("Questions: ", tags);
		return tags.data;
	};

	handleSearchQuery = async (query) => {
		console.log("search query called!");
		const searchTerms = query.trim().toLowerCase().split(/\s+/);
		console.log("search terms: ", searchTerms);

		let questionResp = await axios.post(
			"http://localhost:8000/posts/question/search",
			{ searchTerms: searchTerms }
		);

		return questionResp.data;
	};

	sortQuestionsByDate = async (questions) => {
		console.log("sort by date!");
		questions.sort(
			(a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time)
		);
		return questions;
	};

	sortQuestionsByAnswerActivity = async (questions) => {
		console.log("Sort by ans activity");
		const unansweredQuestions = questions.filter(
			(question) => question.answers.length === 0
		);
		const answeredQuestions = questions.filter(
			(question) => question.answers.length > 0
		);
		const ansResp = await axios.get("http://localhost:8000/posts/answer/");
		const answers = ansResp.data;

		answeredQuestions.sort((a, b) => {
			const mostRecentAnswerDateA = Math.max(
				...a.answers.map(
					(ansId) =>
						answers.find((answer) => {
							console.log("Answer: ", answer, ansId);
							return answer._id === ansId;
						}).ans_date
				)
			);
			const mostRecentAnswerDateB = Math.max(
				...b.answers.map(
					(ansId) =>
						answers.find((answer) => {
							console.log("Answer: ", answer, ansId);
							return answer._id === ansId;
						}).ans_date
				)
			);
			return mostRecentAnswerDateB - mostRecentAnswerDateA;
		});

		const sortedQuestions = answeredQuestions.concat(unansweredQuestions);
		console.log("Sorted questions: ", sortedQuestions);
		return sortedQuestions;
	};

	getUnAsnweredQuestions = async (questions) => {
		return questions.filter((question) => question.answers.length === 0);
	};

	getQuestionById = async (qid) => {
		let questionResp = await axios.get(
			`http://localhost:8000/posts/question/${qid}`
		);
		return questionResp.data;
	};

	getAnswersByQID = async (qid) => {
		const ansResp = await axios.get(
			`http://localhost:8000/posts/answer/questionid/${qid}`
		);
		let ans = ansResp.data;
		ans.sort((a, b) => b.ans_date - a.ans_date);
		return ans;
	};

	createNewTags = async (tags) => {
		let resp = await axios.post("http://localhost:8000/posts/tag/addtag", {
			tags: tags,
		});
		console.log("resp: ", resp.data);
		return resp.data;
	};

	getNumQuestionsWithTag = (tid, questions) => {
		let res = 0;
		console.log("Questions: ", questions);
		for (let question of questions) {
			if (question.tags.find((tag) => tag === tid) !== undefined) {
				res++;
			}
		}
		return res;
	};

	getTagByID = async (tid) => {
		let tags = await axios.get(`http://localhost:8000/posts/tag/${tid}`);
		console.log(tags.data);
		return tags.data;
	};

	getTagByName = async (tname) => {
		let tag = await axios.get(
			`http://localhost:8000/posts/tag/name/${tname}`
		);
		return tag.data;
	};

	getQuestionsWithTagID = async (tid) => {
		let questions = await this.getQuestions();
		return questions.filter((question) => question.tags.includes(tid));
	};

	getNumQuestions = async () => {
		let questions = await this.getQuestions();
		return questions.length;
	};

	incrementViews = async (qid) => {
		let resp = await axios.post(
			`http://localhost:8000/posts/question/incrementviews/${qid}`
		);
		console.log(resp.data);
		return resp;
	};

	login = async (email, password) => {
		try {
			const response = await axios.post(
				"http://localhost:8000/auth/login",
				{
					email,
					password,
				},
				{
					withCredentials: true,
				}
			);

			if (response.status === 200) {
				return { success: true, token: response.data.token };
			} else {
				return {
					success: false,
					message: "Unexpected error occurred during login.",
				};
			}
		} catch (error) {
			if (error.response) {
				const statusCode = error.response.status;
				if (statusCode === 401) {
					return {
						success: false,
						message: "Invalid email or password.",
					};
				} else if (statusCode === 404) {
					return { success: false, message: "User not found." };
				} else if (statusCode === 500) {
					return {
						success: false,
						message: "Server error. Please try again later.",
					};
				} else {
					return {
						success: false,
						message: "An error occurred. Please try again.",
					};
				}
			} else {
				return {
					success: false,
					message:
						"Network error. Please check your internet connection.",
				};
			}
		}
	};

	register = async (username, email, password) => {
		try {
			const response = await axios.post(
				"http://localhost:8000/auth/register",
				{
					username,
					email,
					password,
				}
			);

			if (response.status === 201) {
				return { success: true, message: "Registration successful." };
			} else {
				return {
					success: false,
					message: "Unexpected error occurred during registration.",
				};
			}
		} catch (error) {
			if (error.response) {
				const statusCode = error.response.status;
				if (statusCode === 409) {
					return {
						success: false,
						message: "Username or email is already registered.",
					};
				} else if (statusCode === 500) {
					return {
						success: false,
						message: "Server error. Please try again later.",
					};
				} else {
					return {
						success: false,
						message: "An error occurred. Please try again.",
					};
				}
			} else {
				return {
					success: false,
					message:
						"Network error. Please check your internet connection.",
				};
			}
		}
	};

	getQuestionComments = async (qid) => {
		try {
			const resp = await axios.get(
				`http://localhost:8000/comments/getQuestion/${qid}`
			);
			if (resp.status === 200) {
				return { success: true, data: resp.data };
			} else {
				return { success: false, message: "Error fetching comments" };
			}
		} catch (error) {
			return { success: false, message: "Network error." };
		}
	};

	setAuthHeader = (token) => {
		if (token) {
			axios.defaults.headers.common["Authorization"] = token;
		} else {
			delete axios.defaults.headers.common["Authorization"];
		}
	};

	upvoteQuestion = async (questionId, token) => {
		try {
			this.setAuthHeader(token);
			const response = await axios.post(
				`http://localhost:8000/posts/question/upvote/`,
				{
					id: questionId,
				}
			);
			return response.data;
		} catch (error) {
			if (error.response.status === 403) {
				Cookies.remove("token");
				return "Token expired";
			}
			console.error("Error:", error);
			return error;
		}
	};

	// Downvote a question with token verification
	downvoteQuestion = async (questionId, token) => {
		try {
			this.setAuthHeader(token);
			const response = await axios.post(
				`http://localhost:8000/posts/question/downvote/`,
				{
					id: questionId,
				}
			);
			return response.data;
		} catch (error) {
			if (error.response.status === 403) {
				Cookies.remove("token");
				return "Token expired";
			}

			console.error("Error:", error);
			return error;
		}
	};

	upvoteAnswer = async (aid, token) => {
		try {
			this.setAuthHeader(token);
			const response = await axios.post(
				`http://localhost:8000/posts/answer/upvote/`,
				{
					id: aid,
				}
			);
			return response.data;
		} catch (error) {
			if (error.response.status === 403) {
				Cookies.remove("token");
				return "Token expired";
			}
			console.error("Error:", error);
			return error;
		}
	};

	downvoteAnswer = async (aid, token) => {
		try {
			this.setAuthHeader(token);
			const response = await axios.post(
				`http://localhost:8000/posts/answer/downvote/`,
				{
					id: aid,
				}
			);
			return response.data;
		} catch (error) {
			if (error.response.status === 403) {
				Cookies.remove("token");
				return "Token expired";
			}

			console.error("Error:", error);
			return error;
		}
	};	

	getCommentsForQuestion = async (questionId) => {
		try {
			const response = await axios.get(
				`http://localhost:8000/comments/getQuestion/${questionId}`
			);
			return response.data;
		} catch (error) {
			console.error("Error:", error);
			throw error;
		}
	};

	getCommentsForAnswer = async (answerId) => {
		try {
			const response = await axios.get(
				`http://localhost:8000/comments/answer/${answerId}`
			);
			return response.data;
		} catch (error) {
			console.error("Error:", error);
			throw error;
		}
	};

	createNewAns = async (text, qid) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);
			let newAns = await axios.post(
				"http://localhost:8000/posts/answer/addanswer",
				{ text: text, qid: qid }
			);
			console.log(newAns);

			return newAns.data;
		} catch (error) {
			if (error.response.status === 403) {
				Cookies.remove("token");
				return "Token expired";
			}
			console.error("Error:", error);
			return error;
		}
	};

	editAns = async (text, aid) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);
			let newAns = await axios.post(
				"http://localhost:8000/posts/answer/edit",
				{ text: text, aid: aid }
			);
			console.log(newAns);

			return newAns.data;
		} catch (error) {
			if (error.response.status === 403) {
				Cookies.remove("token");
				return "Token expired";
			}
			console.error("Error:", error);
			return error;
		}
	};

	addNewQuestion = async (title, text, tags, summary) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);
			const response = await axios.post(
				"http://localhost:8000/posts/question/addquestion",
				{ title: title, text: text, tags: tags, summary: summary }
			);
			console.log("resp: ", response.data);
			return response.data;
		} catch (error) {
			console.error("Error:", error);
			if (error.response.status === 403) {
				Cookies.remove("token");
				console.log("removed token");
				return "Token expired";
			}
			console.error("Error:", error);
			return error;
		}
	};

	updateQuestion = async (title, text, tags, qid, summary) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);
			const response = await axios.post(
				"http://localhost:8000/posts/question/updatequestion",
				{ title: title, text: text, tags: tags, qid: qid, summary: summary }
			);
			console.log("resp: ", response.data);
			return response.data;
		} catch (error) {
			console.error("Error:", error);
			if (error.response.status === 403) {
				Cookies.remove("token");
				console.log("removed token");
				return "Token expired";
			}
			console.error("Error:", error);
			return error;
		}
	};

	addComment = async (commentData) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);
			const response = await axios.post(
				"http://localhost:8000/comments/addcomment",
				commentData
			);
			return response.data;
		} catch (error) {
			console.log(error.response);
			if (error.response) {
				if (error.response.status === 400) {
					alert("Error: " + error.response.data.error);
				}
			} else {
				console.error("Error adding comment:", error.message);
			}
			return null;
		}
	};

	upvoteComment = async (commentId) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);
			const response = await axios.post(
				`http://localhost:8000/comments/upvote`,
				{ id: commentId }
			);

			// If request is successful, return the response data
			return response.data;
		} catch (error) {
			// If there's an error response
			if (error.response) {
				// Check if the error status is 401 Unauthorized (Token expired)
				if (error.response.status === 401) {
					// Show an alert with the error message
					alert("Token expired");
				}
			} else {
				// Handle other types of errors
				console.error("Error upvoting comment:", error.message);
			}
			// Return null or handle the error as needed
			return null;
		}
	};

	getUserAuth = async (uid=null) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);
			console.log("UUID: ", uid);
			const response = await axios.get(`http://localhost:8000/auth/details/${uid}`);
			// If request is successful, return the response data
			return response.data;
		} catch (error) {
			// If there's an error response
			if (error.response) {
				// Check if the error status is 401 Unauthorized (Token expired)
				if (error.response.status === 401) {
					// Show an alert with the error message
					alert("Token expired");
				}
			} else {
				// Handle other types of errors
				console.error("Error upvoting comment:", error.message);
			}
			// Return null or handle the error as needed
			return null;
		}
	};

	getUserData = async (uid=null) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);
			const response = await axios.get(`http://localhost:8000/auth/data/${uid}`);
			// If request is successful, return the response data
			return response.data;
		} catch (error) {
			// If there's an error response
			if (error.response) {
				// Check if the error status is 401 Unauthorized (Token expired)
				if (error.response.status === 401) {
					// Show an alert with the error message
					alert("Token expired");
				}
			} else {
				// Handle other types of errors
				console.error("Error upvoting comment:", error.message);
			}
			// Return null or handle the error as needed
			return null;
		}
	};

	fetchOtherUser = async (id) => {
		try {
			const response = await axios.get(`http://localhost:8000/posts/tag/otheruser/${id}`);
			return response.data;
		} catch (error) {
			console.error("Error fetching other user:", error);
			throw error;
		}
	};

	deleteTag = async (tid) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);			
			const response = await axios.post('http://localhost:8000/posts/tag/delete', {tid: tid});
			console.log(response.data); // Output: OK.
			return response.data;
		} catch (error) {
			console.error('Error:', error);
			throw error;
		}
	};

	editTag = async (tid, newText) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);				
			const response = await axios.post('http://localhost:8000/posts/tag/edittag', {
				tid: tid,
				text: newText,
			});
			console.log('Tag edited successfully:', response.data.tag);
			return response.data.tag;
		} catch (error) {
			console.error('Failed to edit tag:', error);
			throw error;
		}
	};

	deleteQuestion = async (qid) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);				
			const response = await axios.post('http://localhost:8000/posts/question/delete', { qid });
			console.log('Delete question response:', response.data);
			return response.data; // Return response data if needed
		} catch (error) {
			console.error('Error deleting question:', error);
			throw error; // Handle error appropriately
		}
	};

	deleteAnswer = async (aid) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);			
			const response = await axios.post('http://localhost:8000/posts/answer/delete', { aid });
			console.log('Delete answer response:', response.data);
			return response.data; // Return response data if needed
		} catch (error) {
			console.error('Error deleting answer:', error);
			throw error; // Handle error appropriately
		}
	};

	fetchUsers = async () => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);	
			const response = await axios.get('http://localhost:8000/auth/users');
			const data = response.data;
			console.log(data);
			return data;
		} catch (error) {
			// Handle errors
			console.error('Error fetching data:', error);
			throw error;
		}
	};

	deleteUser = async (uid) => {
		try {
			let token = Cookies.get("token");
			this.setAuthHeader(token);			
			const response = await axios.post('http://localhost:8000/auth/delete', { uid });
			console.log('Delete user response:', response.data);
			return response.data; // Return response data if needed
		} catch (error) {
			console.error('Error deleting answer:', error);
			throw error; // Handle error appropriately
		}
	};	
	
	optimizeTags = async() => {
		try {	
			const response = await axios.post('http://localhost:8000/posts/tag/optimizetags');
			console.log('optimize tags response:', response.data);
			return response.data; // Return response data if needed
		} catch (error) {
			console.error('Error deleting answer:', error);
			throw error; // Handle error appropriately
		}		
	}
}
